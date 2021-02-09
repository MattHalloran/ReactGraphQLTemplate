// This page gives the admin the ability to:
// 1) Delete existing SKUs
// 2) Edit existing SKU data, including general plant info, availability, etc.
// 3) Create a new SKU, either from scratch or by using plant species info

import React, { useLayoutEffect, useState } from 'react';
import { StyledAdminInventoryPage, StyledSkuPopup, StyledCard } from './AdminInventoryPage.styled';
import PropTypes from 'prop-types';
import { useHistoryState } from 'utils/useHistoryState';
import Modal from 'components/wrappers/Modal/Modal';
import { getInventory, getPlants, getInventoryFilters, modifySku } from 'query/http_promises';
import Button from 'components/Button/Button';
import { SORT_OPTIONS } from 'utils/consts';
import { getTheme } from 'utils/storage';
import DropDown from 'components/inputs/DropDown/DropDown';
import InputText from 'components/inputs/InputText/InputText';
// Icons
import { TrashIcon, EditIcon, HideIcon } from 'assets/img';

function AdminInventoryPage({
    theme = getTheme(),
}) {
    // Holds the existing SKUs list
    const [skuCards, setSkuCards] = useState([]);
    // Holds the existing plants list
    const [plantCards, setPlantCards] = useState([]);
    // Dictionary of sku and plant data, or an empty dictionary
    const [currSku, setCurrSku] = useState(null);
    const [trait_options, setTraitOptions] = useState(null);
    const page_size = Math.ceil(window.innerHeight / 200) * Math.ceil(window.innerWidth / 200);

    useLayoutEffect(() => {
        let mounted = true;
        document.title = "Edit Inventory Info";
        getInventory(SORT_OPTIONS[0].value, page_size, true)
            .then((response) => {
                if (!mounted) return;
                setSkuCards(response.page_results);
                console.log('SETTING SKUS', response.page_results)
                //setSkuCards(skus => skus.concat(response.all_skus));
                //console.log('SET ALL SKUS', response.all_skus)
            })
            .catch((error) => {
                console.error("Failed to load inventory", error);
                alert(error.error);
            });
        getPlants('A-Z')
            .then((response) => {
                if (!mounted) return;
                setPlantCards(response.page_results);
                console.log('SETTING PLANTSSSS', response.page_results)
            })
            .catch((error) => {
                console.error("Failed to load plants", error);
                alert(error.error);
            });
        getInventoryFilters()
            .then((response) => {
                if (!mounted) return;
                setTraitOptions(response);
            })
            .catch((error) => {
                console.error("Failed to load filters", error);
            });

        return () => mounted = false;
    }, [])

    const deleteSku = (sku) => {
        if (!window.confirm('SKUs can be hidden from the shopping page. Are you sure you want to permanently delete this SKU?')) return;
        modifySku(sku.sku, 'DELETE')
            .then((response) => {
                //TODO update list to reflect status chagne
                console.log('TODOOO')
            })
            .catch((error) => {
                console.error(error);
                alert("Failed to delte sku");
            });
    }

    const editSku = () => {

    }

    const hideSku = (sku) => {
        let operation = sku.status === 'ACTIVE' ? 'HIDE' : 'UNHIDE';
        modifySku(sku.sku, operation)
            .then((response) => {
                //TODO update list to reflect status chagne
                console.log('TODOOO')
            })
            .catch((error) => {
                console.error("Failed to modify sku", error);
            });
    }

    const newEmptySku = () => setCurrSku({});

    const newPlantSku = () => {

    }

    // const uploadFile = useCallback((file) => {
    //     if(!file) {
    //         alert('No file selected!');
    //         return;
    //     }
    //     let form = new FormData();
    //     selected.forEach(img => {
    //         form.append('name', img.name);
    //         form.append('extension', img.extension);
    //         form.append('image', img.data);
    //     });
    //     uploadGalleryImages(form).then(response => {
    //         alert('Successfully uploaded ' + response.passed_indexes?.length + ' images!');
    //     }).catch(error => {
    //         console.error(error);
    //         alert('Error uploading images!');
    //     });
    // }, [selected])

    const processFile = (file) => {
        let reader = new FileReader();
        reader.onloadend = () => {
            let fileData = reader.result;
            console.log('GOT FILE DATAAAA', fileData);
            //setSelected(images => [...images, imageData])
        }
        reader.readAsDataURL(file);
    }

    // Processes a single file
    const fileSelectedHandler = (event) => {
        let files = event.target.files;
        if (files.length <= 0) return;
        let extension = files[0].name.split('.')[0];
        if (extension !== 'xls') {
            alert('File must have the extension .xls');
            return;
        }
        processFile(files[0]);
    }

    let popup = (currSku) ? (
        <Modal onClose={() => setCurrSku(null)}>
            <SkuPopup theme={theme} data={currSku} trait_options={trait_options} />
        </Modal>
    ) : null;

    return (
        <StyledAdminInventoryPage className="page" theme={theme}>
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
                Upload Spreadsheet<input className="primary" type="file" onChange={fileSelectedHandler}/>
            </div>

            <div className="flexed">
                <div className="flex-content">
                    <p>Select existing SKU to open editor</p>
                    <div className="card-flex">
                        {skuCards.map((data, index) => <SkuCard key={index} onEdit={editSku} onHide={hideSku} onDelete={deleteSku} sku={data} />)}
                    </div>
                </div>
                <div className="flex-content">
                    <p>Select plant template to create a new SKU</p>
                    <div className="card-flex">
                        {plantCards.map((data, index) => <PlantCard key={index} onEdit={editSku} onHide={hideSku} onDelete={deleteSku} plant={data} />)}
                    </div>
                </div>
            </div>
        </StyledAdminInventoryPage >
    );
}

AdminInventoryPage.propTypes = {
    theme: PropTypes.object,
}

export default AdminInventoryPage;

function SkuCard({
    onEdit,
    onHide,
    onDelete,
    sku,
    theme = getTheme(),
}) {
    let plant = sku?.plant;

    return (
        <StyledCard theme={theme} onClick={onEdit} status={sku?.status}>
            <h2 className="title">{plant?.latin_name}</h2>
            <img src={`data:image/jpeg;base64,${sku.display_image}`} alt="TODO" />
            <div className="icon-container">
                <EditIcon width="30px" height="30px" onClick={() => onEdit(sku)} />
                <HideIcon width="30px" height="30px" onClick={() => onHide(sku)} />
                <TrashIcon width="30px" height="30px" onClick={() => onDelete(sku)} />
            </div>
        </StyledCard>
    );
}

SkuCard.propTypes = {
    data: PropTypes.object.isRequired,
    onEdit: PropTypes.func.isRequired,
    onHide: PropTypes.func.isRequired,
    onDelete: PropTypes.func.isRequired,
}

function PlantCard({
    plant,
}) {

    return (
        <StyledCard>
            <h3>{plant?.latin_name}</h3>
        </StyledCard>
    );
}

SkuCard.propTypes = {
    plant: PropTypes.object.isRequired
}

function SkuPopup({
    data,
    theme = getTheme(),
    trait_options
}) {
    console.log('PROP UPPPPPPPP', data);
    const [latin_name, setLatinName] = useHistoryState("ai_latin_name", "");
    const [common_name, setCommonName] = useHistoryState("ai_common_name", "");
    const [drought_tolerance, setDroughtTolerance] = useHistoryState("ai_drought_tolerance", "");
    const [grown_height, setGrownHeight] = useHistoryState("ai_grown_height", "");
    const [grown_spread, setGrownSpread] = useHistoryState("ai_grown_spread", "");
    const [growth_rate, setGrowthRate] = useHistoryState("ai_growth_rate", "");
    const [optimal_light, setOptimalLight] = useHistoryState("ai_optimal_light", "");
    const [salt_tolerance, setSaltTolerance] = useHistoryState("ai_salt_tolerance", "");

    // Returns an input text or a dropdown, depending on if the field is in the trait options
    const getInput = (field, label, value, valueFunc) => {
        if (!trait_options || !trait_options[field] || trait_options[field].length <= 0) return (
            <InputText
                label={label}
                type="text"
                value={value}
                valueFunc={valueFunc}
            />
        )
        let options = trait_options[field].map((o, index) => { return { label: o, value: index } })
        return (
            <div>
                <label>{label}</label>
                <DropDown
                    multi_select={true}
                    allow_custom_input={true}
                    className="sorter"
                    options={options}
                    onChange={(e) => valueFunc(e.value)} />
            </div>
        )
    }

    return (
        <StyledSkuPopup theme={theme}>
            <div>
                <InputText
                    label="Latin Name"
                    type="text"
                    value={latin_name}
                    valueFunc={setLatinName}
                />
                <InputText
                    label="Common Name"
                    type="text"
                    value={common_name}
                    valueFunc={setCommonName}
                />
                <div className="half">
                    {getInput('drought_tolerances', 'Drought Tolerance', drought_tolerance, setDroughtTolerance)}
                    {getInput('grown_heights', 'Grown Height', grown_height, setGrownHeight)}
                    {getInput('grown_spreads', 'Grown Spread', grown_spread, setGrownSpread)}
                    {getInput('growth_rates', 'Growth Rate', growth_rate, setGrowthRate)}
                    {getInput('optimal_lights', 'Optimal Light', optimal_light, setOptimalLight)}
                    {getInput('salt_tolerances', 'Salt Tolerance', salt_tolerance, setSaltTolerance)}
                </div>
                <div className="half">

                </div>
            </div>
        </StyledSkuPopup>
    );
}

SkuPopup.propTypes = {
    data: PropTypes.object.isRequired,
    theme: PropTypes.object,
    trait_options: PropTypes.object,
}

export { SkuPopup };