// This page gives the admin the ability to:
// 1) Delete existing SKUs
// 2) Edit existing SKU data, including general plant info, availability, etc.
// 3) Create a new SKU, either from scratch or by using plant species info

import React, { useLayoutEffect, useState, useEffect } from 'react';
import { StyledAdminInventoryPage, StyledSkuPopup, StyledCard } from './AdminInventoryPage.styled';
import PropTypes from 'prop-types';
import { useHistoryState } from 'utils/useHistoryState';
import Modal from 'components/wrappers/Modal/Modal';
import { getInventory, getPlants, getInventoryFilters, modifySku, uploadAvailability} from 'query/http_promises';
import Button from 'components/Button/Button';
import { SORT_OPTIONS, PUBS } from 'utils/consts';
import { PubSub } from 'utils/pubsub';
import { getTheme, getSession } from 'utils/storage';
import DropDown from 'components/inputs/DropDown/DropDown';
import InputText from 'components/inputs/InputText/InputText';
// Icons
import { TrashIcon, EditIcon, HideIcon, NoImageIcon } from 'assets/img';
import FileUpload from 'components/FileUpload/FileUpload';

function AdminInventoryPage() {
    const [theme, setTheme] = useState(getTheme());
    const [session, setSession] = useState(getSession());
    // Holds the selected availability file, if uploading one
    const [selected, setSelected] = useState(null);
    // Holds the existing SKUs list
    const [skuCards, setSkuCards] = useState([]);
    // Holds the existing plants list
    const [plantCards, setPlantCards] = useState([]);
    // Dictionary of sku and plant data, or an empty dictionary
    const [currSku, setCurrSku] = useState(null);
    const [trait_options, setTraitOptions] = useState(null);
    const page_size = Math.ceil(window.innerHeight / 200) * Math.ceil(window.innerWidth / 200);

    useEffect(() => {
        let themeSub = PubSub.subscribe(PUBS.Theme, (_, o) => setTheme(o));
        let sessionSub = PubSub.subscribe(PUBS.Session, (_, o) => setSession(o));
        return (() => {
            PubSub.unsubscribe(themeSub);
            PubSub.unsubscribe(sessionSub);
        })
    }, [])

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
        modifySku(session?.email, session?.token, sku.sku, 'DELETE', {})
            .then((response) => {
                //TODO update list to reflect status chagne
                console.log('TODOOO')
            })
            .catch((error) => {
                console.error(error);
                alert("Failed to delte sku");
            });
    }

    const editSku = (sku_data) => {
        setCurrSku(sku_data);
    }

    const hideSku = (sku) => {
        let operation = sku.status === 'ACTIVE' ? 'HIDE' : 'UNHIDE';
        modifySku(session?.email, session?.token, sku.sku, operation, {})
            .then((response) => {
                //TODO update list to reflect status chagne
                console.log('TODOOO')
            })
            .catch((error) => {
                console.error("Failed to modify sku", error);
            });
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
            setSelected(fileData);
        }
        reader.readAsDataURL(file);
    }

    // Processes a single file
    const fileSelectedHandler = (event) => {
        let files = event.target.files;
        let extension = files[0].name.split('.')[0];
        if (extension !== 'xls') {
            alert('File must have the extension .xls');
            return;
        }
        processFile(files[0]);
    }

    const sendAvailability = () => {
        if (!selected) return;
        let form = new FormData();
        form.append('data', selected)
        uploadAvailability(form).then(() => {
            alert('Successfully uploaded availability! Refresh page to see results');
        }).catch(error => {
            console.error(error);
            alert('Error uploading availability!');
        });
    }

    let popup = (currSku) ? (
        <Modal onClose={() => setCurrSku(null)}>
            <SkuPopup session={session} theme={theme} sku={currSku} trait_options={trait_options} />
        </Modal>
    ) : null;

    return (
        <StyledAdminInventoryPage className="page" theme={theme}>
            {popup}
            <h1>Welcome to the inventory manager!</h1>
            <h3>This page has the following features:</h3>
            <ul>
                <li>Upload availability from a spreadsheet</li>
                <li>Create a new SKU, either from scratch or with a plant template</li>
                <li>Edit an existing SKU</li>
                <li>Delete a SKU</li>
            </ul>
            <div>
                <Button onClick={() => editSku({})}>Create Empty SKU</Button>
            </div>
            <div>
                Upload Spreadsheet<FileUpload onUploadClick={sendAvailability} onUploadChange={fileSelectedHandler}/>
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
                        {plantCards.map((data, index) => <PlantCard key={index} plant={data} onEdit={editSku} />)}
                    </div>
                </div>
            </div>
        </StyledAdminInventoryPage >
    );
}

AdminInventoryPage.propTypes = {
    
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
        <StyledCard theme={theme} onClick={() => onEdit(sku)} status={sku?.status}>
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
    onEdit,
}) {

    return (
        <StyledCard onClick={() => onEdit({plant: plant})}>
            <h3>{plant?.latin_name}</h3>
        </StyledCard>
    );
}

SkuCard.propTypes = {
    plant: PropTypes.object.isRequired,
    onEdit: PropTypes.func.isRequired,
}

function SkuPopup({
    session = getSession(),
    sku,
    theme = getTheme(),
    trait_options
}) {
    console.log('PROP UPPPPPPPP', sku);
    let plant = sku.plant;
    const [latin_name, setLatinName] = useHistoryState("ai_latin_name", plant?.latin_name ?? '');
    const [common_name, setCommonName] = useHistoryState("ai_common_name", plant?.common_name ?? '');
    const [code, setCode] = useHistoryState("ai_code", sku.sku ?? '');
    const [size, setSize] = useHistoryState("ai_size", sku.size ?? '');
    const [price, setPrice] = useHistoryState("ai_price", sku.price ?? '');
    const [quantity, setQuantity] = useHistoryState("ai_quantity", sku.availability ?? '');
    const [drought_tolerance, setDroughtTolerance] = useHistoryState("ai_drought_tolerance", "");
    const [grown_height, setGrownHeight] = useHistoryState("ai_grown_height", "");
    const [grown_spread, setGrownSpread] = useHistoryState("ai_grown_spread", "");
    const [growth_rate, setGrowthRate] = useHistoryState("ai_growth_rate", "");
    const [optimal_light, setOptimalLight] = useHistoryState("ai_optimal_light", "");
    const [salt_tolerance, setSaltTolerance] = useHistoryState("ai_salt_tolerance", "");

    //Used for display image upload
    const [selectedImage, setSelectedImage] = useState(null);

    const saveSku = () => {
        let plant_data = {
            "latin_name": latin_name,
            "common_name": common_name,
            "drought_tolerance": drought_tolerance,
            "grown_height": grown_height,
            "grown_spread": grown_spread,
            "growth_rate": growth_rate,
            "optimal_light": optimal_light,
            "salt_tolerance": salt_tolerance
        }
        let sku_data = {
            "code": code,
            "size": size,
            "price": price,
            "quantity": quantity,
            "plant": plant_data,
        }
        modifySku(session?.email, session?.token, sku.sku, 'UPDATE', sku_data)
            .then(() => {
                alert('SKU Updated!')
            })
            .catch((error) => {
                console.error(error);
                alert('Failed to update SKU!')
            });
    }

    // Returns an input text or a dropdown, depending on if the field is in the trait options
    const getInput = (field, label, value, valueFunc, multi_select = true) => {
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
                    multi_select={multi_select}
                    allow_custom_input={true}
                    className="sorter"
                    options={options}
                    onChange={(e) => valueFunc(e.value)} />
            </div>
        )
    }

    const fileSelectedHandler = (event) => {
        let imageFile = event.target.files[0];
        let fileSplit = imageFile.name.split('.');
        processImage(event.target.files[0], fileSplit[0], fileSplit[1]);
    }

    const processImage = (file, name, extension) => {
        let reader = new FileReader();
        reader.onloadend = () => {
            setSelectedImage({
                name: name,
                extension: extension,
                data: reader.result
            });
        }
        reader.readAsDataURL(file);
    }

    //Show display image from uploaded image.
    //If no upload image, from model data.
    //If not model data, show NoImageIcon
    let image_data;
    if (selectedImage?.data) {
        image_data = selectedImage?.data
    } else if (sku?.display_image) {
        image_data = `data:image/jpeg;base64,${sku.display_image}`
    }
    let display_image;
    if (image_data) {
        display_image = <img src={image_data} className="display-image" alt="TODO" />
    } else {
        display_image = <NoImageIcon className="display-image" />
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
                <InputText
                    label="Plant Code"
                    type="text"
                    value={code}
                    valueFunc={setCode}
                />
                <div className="half">
                    {getInput('size', 'Size', size, setSize, false)}
                    {getInput('drought_tolerance', 'Drought Tolerance', drought_tolerance, setDroughtTolerance)}
                    {getInput('grown_height', 'Grown Height', grown_height, setGrownHeight)}
                    {getInput('grown_spread', 'Grown Spread', grown_spread, setGrownSpread)}
                    {getInput('growth_rate', 'Growth Rate', growth_rate, setGrowthRate)}
                    {getInput('optimal_light', 'Optimal Light', optimal_light, setOptimalLight)}
                    {getInput('salt_tolerance', 'Salt Tolerance', salt_tolerance, setSaltTolerance)}
                </div>
                <div className="half">
                    <InputText
                        label="Price"
                        type="text"
                        value={price}
                        valueFunc={setPrice}
                    />
                    <InputText
                        label="Quanity"
                        type="text"
                        value={quantity}
                        valueFunc={setQuantity}
                    />
                    <p>Display Image</p>
                    {display_image}
                    <FileUpload selectText="Select" showFileName={false} showUploadButton={false} onUploadChange={fileSelectedHandler} />
                </div>
            </div>
            <Button onClick={saveSku}>Save SKU</Button>
        </StyledSkuPopup>
    );
}

SkuPopup.propTypes = {
    session: PropTypes.object,
    sku: PropTypes.object.isRequired,
    theme: PropTypes.object,
    trait_options: PropTypes.object,
}

export { SkuPopup };