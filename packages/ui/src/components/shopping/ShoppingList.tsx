import { useState, useEffect } from "react";
import { useParams, useHistory } from "react-router-dom";
import { productsQuery } from 'graphql/query';
import { upsertOrderItemMutation } from 'graphql/mutation';
import { useQuery, useMutation } from '@apollo/client';
import { getProductTrait, LINKS } from "utils";
import {
    ProductCard,
    ProductDialog
} from 'components';
import { makeStyles } from '@material-ui/styles';
import { mutationWrapper } from "graphql/utils/wrappers";
import { CommonProps, Product, Sku } from 'types';
import { products, productsVariables, products_products } from "graphql/generated/products";
import { upsertOrderItem } from "graphql/generated/upsertOrderItem";
import { SkuSortBy } from "graphql/generated/globalTypes";

const useStyles = makeStyles(() => ({
    root: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
        alignItems: 'stretch',
    },
}));

interface Props {
    sortBy: SkuSortBy;
    filters: {};
    searchString: string;
}

export const ShoppingList = ({
    onSessionUpdate,
    cart,
    sortBy = SkuSortBy.AZ,
    filters,
    searchString = '',
}: Pick<CommonProps, 'onSessionUpdate' | 'cart'> & Props) => {
    const classes = useStyles();
    // Product data for all visible products (i.e. not filtered)
    const [products, setProducts] = useState<Product[]>([]);
    const track_scrolling_id = 'scroll-tracked';
    let history = useHistory();
    const urlParams = useParams<{sku?: string}>();
    // Find current product and current sku
    const currProduct: Product | null = products?.find((p: Product) => p?.skus?.some((s: Sku) => s.sku === urlParams.sku)) ?? null;
    const currSku = currProduct?.skus ? currProduct.skus.find((s: Sku) => s.sku === urlParams.sku) : null;
    const { data: productData } = useQuery<products, productsVariables>(productsQuery,  { variables: { sortBy, searchString } });
    const [upsertOrderItem] = useMutation<upsertOrderItem>(upsertOrderItemMutation);
    // useHotkeys('Escape', () => setCurrSku([null, null, null]));

    // Determine which skus will be visible to the customer (i.e. not filtered out)
    useEffect(() => {
        if (!filters || Object.values(filters).length === 0) {
            setProducts(productData?.products ?? []);
            return;
        }
        let filtered_products: products_products[] = [];
        for (const product of productData?.products ?? []) {
            let found = false;
            for (const [key, value] of Object.entries(filters)) {
                if (found) break;
                const traitValue = getProductTrait(key, product);
                if (traitValue && traitValue.toLowerCase() === (value+'').toLowerCase()) {
                    found = true;
                    break;
                }
                if (!Array.isArray(product.skus)) continue;
                for (let i = 0; i < product.skus.length; i++) {
                    const skuValue = product.skus[i][key];
                    if (skuValue && skuValue.toLowerCase() === (value+'').toLowerCase()) {
                        found = true;
                        break;
                    }
                }
            }
            if (found) filtered_products.push(product);
        }
        setProducts(filtered_products);
    }, [productData, filters, searchString])

    const expandSku = (sku: string) => {
        history.push(LINKS.Shopping + "/" + sku);
    };

    const toCart = () => {
        history.push(LINKS.Cart);
    }

    const addToCart = (name, sku, quantity) => {
        let max_quantity = parseInt(sku.availability);
        if (Number.isInteger(max_quantity) && quantity > max_quantity) {
            alert(`Error: Cannot add more than ${max_quantity}!`);
            return;
        }
        mutationWrapper({
            mutation: upsertOrderItem,
            data: { variables: { quantity, orderId: cart?.id, skuId: sku.id } },
            successCondition: (response) => response.data.upsertOrderItem,
            onSuccess: () => onSessionUpdate(),
            successMessage: () => `${quantity} ${name}(s) added to cart.`,
            successData: { buttonText: 'View Cart', buttonClicked: toCart },
        })
    }

    return (
        <div className={classes.root} id={track_scrolling_id}>
            {(currProduct) ? <ProductDialog
                product={currProduct}
                selectedSku={currSku}
                onAddToCart={addToCart}
                open={currProduct !== null}
                onClose={() => history.goBack()} /> : null}
            
            {products?.map((item, index) =>
                <ProductCard key={index}
                    onClick={(data) => expandSku(data.selectedSku?.sku)}
                    product={item} />)}
        </div>
    );
}