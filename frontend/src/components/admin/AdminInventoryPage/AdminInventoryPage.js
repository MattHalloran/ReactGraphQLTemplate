// This page gives the admin the ability to:
// 1) Delete existing SKUs
// 2) Edit existing SKU data, including general plant info, availability, etc.
// 3) Create a new SKU, either from scratch or by using plant species info

import React, { useLayoutEffect, useState } from 'react';
import { StyledAdminInventoryPage, StyledSkuPopup, StyledSkuCard } from './AdminInventoryPage.styled';
import PropTypes from 'prop-types';
import Modal from 'components/shared/wrappers/Modal/Modal';
import { getInventory } from 'query/http_promises';
import Button from 'components/shared/Button/Button';
// Icons
import TrashIcon from 'assets/img/TrashIcon';
import EditIcon from 'assets/img/EditIcon';
import HideIcon from 'assets/img/HideIcon';

function AdminInventoryPage() {
    // Holds the existing SKUs list
    const [skuCards, setSkuCards] = useState([]);
    // Dictionary of sku and plant data, or an empty dictionary
    const [currSku, setCurrSku] = useState(null);

    useLayoutEffect(() => {
        let mounted = true;
        document.title = "Edit Inventory Info";
        getInventory('A-Z')
            .then((response) => {
                if (!mounted) return;
                setSkuCards(response.page_results);
                console.log('SETTING SKUS', response.page_results)
                //setSkuCards(skus => skus.concat(response.all_skus));
                //console.log('SET ALL SKUS', response.all_skus)
            })
            .catch((error) => {
                console.log("Failed to load inventory");
                console.error(error);
                alert(error.error);
            });
        return () => mounted = false;
    }, [])

    const deleteSku = () => {
        if (!window.confirm('SKUs can be hidden from the shopping page. Are you sure you want to permanently delete this SKU?')) return;
        console.log('TODO')
    }

    const editSku = () => {

    }

    const hideSku = () => {

    }

    const newEmptySku = () => setCurrSku({});

    const newPlantSku = () => {

    }

    let popup = (currSku) ? (
        <Modal onClose={() => setCurrSku(null)}>
            <SkuPopup data={currSku} />
        </Modal>
    ) : null;

    return (
        <StyledAdminInventoryPage>
            {popup}
            <h1>Welcome to the inventory manager!</h1>
            <h3>This page has the following features:</h3>
            <ul>
                <li>Create a new SKU, either from scratch or with a plant template</li>
                <li>Edit an existing SKU</li>
                <li>Delete a SKU</li>
            </ul>
            <div>
                <Button onClick={newEmptySku}>Create Empty SKU</Button>
            </div>

            <div className="flexed">
                <div className="flex-content">
                    <p>Select existing SKU to open editor</p>
                    <div className="card-flex">
                    {skuCards.map((data, index) => <SkuCard key={index} 
                        data={data} onEdit={editSku} onHide={hideSku} onDelete={deleteSku}/>)}
                    </div>
                </div>
                <div className="flex-content">
                    <p>Select plant template to create a new SKU</p>
                </div>
            </div>
        </StyledAdminInventoryPage >
    );
}

AdminInventoryPage.propTypes = {

}

export default AdminInventoryPage;

function SkuCard(props) {
    let sku = props?.data;
    let plant = sku?.plant;

    return (
        <StyledSkuCard onClick={props.onEdit}>
            <h3>{plant?.latin_name}</h3>
            <img src={`data:image/jpeg;base64,${sku.display_image}`} alt="TODO" />
            <div className="icon-container">
                <EditIcon className="icon" width="30px" height="30px" onClick={props.onEdit}/>
                <HideIcon className="icon" width="30px" height="30px" onClick={props.onHide}/>
                <TrashIcon className="icon" width="30px" height="30px" onClick={props.onDelete}/>
            </div>
        </StyledSkuCard>
    );
}

SkuCard.propTypes = {
    data: PropTypes.object.isRequired,
    onEdit: PropTypes.func.isRequired,
    onHide: PropTypes.func.isRequired,
    onDelete: PropTypes.func.isRequired,
}

function SkuPopup(props) {
    return (
        <StyledSkuPopup>
        
      </StyledSkuPopup>
    );
}

SkuPopup.propTypes = {
    data: PropTypes.object.isRequired
}

export { SkuPopup };