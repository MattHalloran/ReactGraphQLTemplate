// This page gives the admin the ability to:
// 1) Delete existing SKUs
// 2) Edit existing SKU data, including general plant info, availability, etc.
// 3) Create a new SKU, either from scratch or by using plant species info

import React, { useLayoutEffect } from 'react';
import { StyledAdminInventoryPage, StyledSkuPopup } from './AdminInventoryPage.styled';

function AdminInventoryPage() {
    useLayoutEffect(() => {
        document.title = "Edit Inventory Info";
    })

    const editSku = () => {

    }

    const newEmptySku = () => {

    }

    const newPlantSku = () => {

    }

    return (
        <StyledAdminInventoryPage>
            <div className="current-skus">
                <p>Edit current SKU</p>
            </div>
            <div className="available-plants-info">
                <p>Add new SKU from existing plant info</p>
            </div>
            <div className="create-sku">
                <p>Create SKU from scratch</p>
            </div>
        </StyledAdminInventoryPage >
    );
}

AdminInventoryPage.propTypes = {

}

export default AdminInventoryPage;

function SkuPopup(props) {
    return (
        null
    );
}

SkuPopup.propTypes = {

}

export { SkuPopup };