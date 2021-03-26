// This page gives the admin the ability to:
// 1) Delete existing SKUs
// 2) Edit existing SKU data, including general plant info, availability, etc.
// 3) Create a new SKU, either from scratch or by using plant species info

import { useLayoutEffect, useState, useEffect, useCallback } from 'react';
import { StyledAdminInventoryPage, StyledPlantPopup, StyledCard } from './AdminInventoryPage.styled';
import PropTypes from 'prop-types';
import Modal from 'components/wrappers/Modal/Modal';
import { getInventory, getUnusedPlants, getInventoryFilters, modifyPlant, uploadAvailability, getImages } from 'query/http_promises';
import { Button } from '@material-ui/core';
import { SORT_OPTIONS, PUBS } from 'utils/consts';
import { PubSub } from 'utils/pubsub';
import { getSession } from 'utils/storage';
import DropDown from 'components/inputs/DropDown/DropDown';
import Collapsible from 'components/wrappers/Collapsible/Collapsible';
import InputText from 'components/inputs/InputText/InputText';
import { displayPrice, displayPriceToDatabase } from 'utils/displayPrice';
import { NoImageIcon } from 'assets/img';
import FileUpload from 'components/FileUpload/FileUpload';
import makeID from 'utils/makeID';
import PlantCard from 'components/PlantCard/PlantCard';

let copy = SORT_OPTIONS.slice();
const PLANT_SORT_OPTIONS = copy.splice(0, 2);

function AdminInventoryPage() {
    const [session, setSession] = useState(getSession());
    // Holds the selected availability file, if uploading one
    const [selected, setSelected] = useState(null);
    // Holds the list of plants with existing SKUs
    const [existing, setExisting] = useState([]);
    const [existingThumbnails, setExistingThumbnails] = useState([]);
    // Holds list of all plants
    const [all, setAll] = useState([]);
    const [allThumbnails, setAllThumbnails] = useState([]);
    // Selected plant data. Used for popup
    const [currPlant, setCurrPlant] = useState(null);
    const [trait_options, setTraitOptions] = useState(null);
    const [existing_sort_by, setExistingSortBy] = useState(SORT_OPTIONS[0].value);
    const [all_sort_by, setAllSortBy] = useState(PLANT_SORT_OPTIONS[0].value);


    useEffect(() => {
        let sessionSub = PubSub.subscribe(PUBS.Session, (_, o) => setSession(o));
        return (() => {
            PubSub.unsubscribe(sessionSub);
        })
    }, [])

    useEffect(() => {
        let ids = existing?.map(p => p.display_id);
        if (!ids) return;
        getImages(ids, 'm').then(response => {
            setExistingThumbnails(response.images);
        }).catch(err => {
            console.error(err);
        });
    }, [existing])

    useEffect(() => {
        let ids = existing?.map(p => p.display_id);
        if (!ids) return;
        getImages(ids, 'm').then(response => {
            setAllThumbnails(response.images);
        }).catch(err => {
            console.error(err);
        });
    }, [all])

    useEffect(() => {
        getInventory(existing_sort_by, 0, true)
            .then((response) => {
                setExisting(response.page_results);
            })
            .catch((error) => {
                console.error("Failed to load inventory", error);
                alert(error.error);
            });
    }, [existing_sort_by])

    useEffect(() => {
        getUnusedPlants(all_sort_by)
            .then((response) => {
                setAll(response.plants);
            })
            .catch((error) => {
                console.error("Failed to load plants", error);
            });
    }, [all_sort_by])

    useLayoutEffect(() => {
        let mounted = true;
        document.title = "Edit Inventory Info";
        getInventoryFilters()
            .then((response) => {
                if (!mounted) return;
                console.log('GOT TRAIT OPTIONS', response);
                setTraitOptions(response);
            })
            .catch((error) => {
                console.error("Failed to load filters", error);
            });

        return () => mounted = false;
    }, [])

    // const deleteSku = (sku) => {
    //     if (!window.confirm('SKUs can be hidden from the shopping page. Are you sure you want to permanently delete this SKU?')) return;
    //     modifySku(session, sku.sku, 'DELETE', {})
    //         .then((response) => {
    //             //TODO update list to reflect status chagne
    //             console.log('TODOOO')
    //         })
    //         .catch((error) => {
    //             console.error(error);
    //             alert("Failed to delte sku");
    //         });
    // }

    // const editSku = (sku_data) => {
    //     setCurrPlant(sku_data);
    // }

    // const hideSku = (sku) => {
    //     let operation = sku.status === 'ACTIVE' ? 'HIDE' : 'UNHIDE';
    //     modifySku(session, sku.sku, operation, {})
    //         .then((response) => {
    //             //TODO update list to reflect status chagne
    //             console.log('TODOOO')
    //         })
    //         .catch((error) => {
    //             console.error("Failed to modify sku", error);
    //         });
    // }

    const processFile = (file) => {
        let reader = new FileReader();
        reader.onloadend = () => {
            let fileData = reader.result;
            setSelected(fileData);
        }
        reader.readAsDataURL(file);
    }

    // Processes a single file
    const fileSelectedHandler = (event) => {
        let files = event.target.files;
        let extension = files[0].name.split('.')[1];
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
            alert('Availability file uploaded! Please give the server up to 15 seconds to update the database, then refresh the page.');
        }).catch(error => {
            console.error(error);
            alert('Error uploading availability!');
        });
    }

    const handleExistingSort = (sort_item, _) => {
        setExistingSortBy(sort_item.value);
    }

    const handleAllSort = (sort_item, _) => {
        setAllSortBy(sort_item.value);
    }

    let popup = (currPlant) ? (
        <Modal onClose={() => setCurrPlant(null)}>
            <PlantPopup session={session} plant={currPlant} trait_options={trait_options} />
        </Modal>
    ) : null;

    return (
        <StyledAdminInventoryPage id="page">
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
                {/* <Button onClick={() => editSku({})}>Create new plant</Button> */}
            </div>
            <div>
                Upload Spreadsheet<FileUpload onUploadClick={sendAvailability} onUploadChange={fileSelectedHandler} />
            </div>

            <Collapsible title="Plants with active SKUs">
                <h2>Sort</h2>
                <DropDown options={SORT_OPTIONS} onChange={handleExistingSort} initial_value={SORT_OPTIONS[0]} />
                <div className="card-flex">
                    {existing?.map((plant, index) => <PlantCard key={index}
                        plant={plant}
                        onClick={() => setCurrPlant(plant)}
                        thumbnail={existingThumbnails?.length >= index ? existingThumbnails[index] : null} />)}
                </div>
            </Collapsible>
            <Collapsible title="Plants without active SKUs">
                <h2>Sort</h2>
                <DropDown options={PLANT_SORT_OPTIONS} onChange={handleAllSort} initial_value={PLANT_SORT_OPTIONS[0]} />
                <div className="card-flex">
                    {all?.map((plant, index) => <PlantCard key={index}
                        plant={plant}
                        onClick={() => setCurrPlant(plant)}
                        thumbnail={allThumbnails?.length >= index ? allThumbnails[index] : null} />)}
                </div>
            </Collapsible>
        </StyledAdminInventoryPage >
    );
}

AdminInventoryPage.propTypes = {

}

export default AdminInventoryPage;

function PlantPopup({
    session = getSession(),
    plant,
    trait_options
}) {
    console.log('PLANT POPUP', plant)
    const [latin_name, setLatinName] = useState(plant.latin_name);
    const [common_name, setCommonName] = useState(plant.common_name);
    const [drought_tolerance, setDroughtTolerance] = useState(plant.drought_tolerance?.value);
    const [grown_height, setGrownHeight] = useState(plant.grown_height?.value);
    const [grown_spread, setGrownSpread] = useState(plant.grown_spread?.value);
    const [growth_rate, setGrowthRate] = useState(plant.growth_rate?.value);
    const [optimal_light, setOptimalLight] = useState(plant.optimal_light?.value);
    const [salt_tolerance, setSaltTolerance] = useState(plant.salt_tolerance?.value);

    // Used for display image upload
    const [selectedImage, setSelectedImage] = useState(null);
    // Used to display selected SKU info
    const [selectedSku, setSelectedSku] = useState(null);
    const [skus, setSkus] = useState(plant.skus ?? []);
    const [code, setCode] = useState(selectedSku?.sku);
    const [size, setSize] = useState(selectedSku?.size);
    const [price, setPrice] = useState(selectedSku?.price);
    const [quantity, setQuantity] = useState(selectedSku?.availability);

    useEffect(() => {
        if (!selectedSku) return;
        selectedSku['sku'] = code;
    }, [code])

    useEffect(() => {
        if (!selectedSku) return;
        selectedSku['size'] = size;
    }, [size])

    useEffect(() => {
        if (!selectedSku) return;
        selectedSku['price'] = displayPriceToDatabase(price);
    }, [price])

    useEffect(() => {
        if (!selectedSku) return;
        selectedSku['availability'] = quantity;
    }, [quantity])

    useEffect(() => {
        console.log('NEW SKU', selectedSku);
        if (!selectedSku) return;
        setCode(selectedSku['sku']);
        setSize(selectedSku['size']);
        setPrice(displayPrice(selectedSku['price']));
        setQuantity(selectedSku['availability']);
        setLatinName(selectedSku['plant']['latin_name']);
        setCommonName(selectedSku['plant']['common_name']);
        setDroughtTolerance(selectedSku['plant']['drought_tolerance']?.value);
        setGrownHeight(selectedSku['plant']['grown_height']?.value);
        setGrownSpread(selectedSku['plant']['grown_spread']?.value)
        setOptimalLight(selectedSku['plant']['optimal_light']?.value);
        setSaltTolerance(selectedSku['plant']['salt_tolerance']?.value);
    }, [selectedSku])

    const savePlant = () => {
        let plant_data = {
            "id": plant['id'],
            "latin_name": latin_name,
            "common_name": common_name,
            "drought_tolerance": drought_tolerance,
            "grown_height": grown_height,
            "grown_spread": grown_spread,
            "growth_rate": growth_rate,
            "optimal_light": optimal_light,
            "salt_tolerance": salt_tolerance,
            "skus": skus,
            "display_image": selectedImage,
        }
        console.log('GOING TO MODIFY PLANT', plant_data)
        modifyPlant(session, 'UPDATE', plant_data)
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
        return (
            <div>
                <label>{label}</label>
                <DropDown
                    multi_select={multi_select}
                    allow_custom_input={true}
                    className="sorter"
                    options={trait_options[field]}
                    onChange={valueFunc} />
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

    const newSku = () => {
        setSkus(l => l.concat({ sku: makeID(10) }))
    }

    const removeSku = useCallback(() => {
        //let index = skus.findIndex(s => s.sku === selectedSku.sku)
        let index = skus.indexOf(selectedSku);
        if (index < 0) return;
        setSkus(l => l.filter(s => s.sku !== selectedSku.sku))
    }, [skus, selectedSku])

    //Show display image from uploaded image.
    //If no upload image, from model data.
    //If not model data, show NoImageIcon
    let image_data;
    if (selectedImage?.data) {
        image_data = selectedImage?.data
    } else if (plant.display_image) {
        image_data = `data:image/jpeg;base64,${plant.display_image}`
    }
    let display_image;
    if (image_data) {
        display_image = <img src={image_data} className="display-image" alt="TODO" />
    } else {
        display_image = <NoImageIcon className="display-image" />
    }

    return (
        <StyledPlantPopup>
            <div className="sidenav">
                <h3>SKUs</h3>
                <div className="sku-list">
                    {skus?.map(s => (
                        <div className={`sku-option ${s === selectedSku ? 'selected' : ''}`}
                            onClick={() => setSelectedSku(s)}>{s.sku}</div>
                    ))}
                </div>
                {selectedSku ? <Button className="delete-sku" onClick={removeSku}>Delete</Button> : null}
                <Button className="add-sku" onClick={newSku}>New SKU</Button>
            </div>
            <div className="plant-info-div">
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
                <div className="third">
                    {getInput('drought_tolerance', 'Drought Tolerance', drought_tolerance, setDroughtTolerance, false)}
                    {getInput('grown_height', 'Grown Height', grown_height, setGrownHeight, false)}
                    {getInput('grown_spread', 'Grown Spread', grown_spread, setGrownSpread, false)}
                </div>
                <div className="third">
                    {getInput('growth_rate', 'Growth Rate', growth_rate, setGrowthRate, false)}
                    {getInput('optimal_light', 'Optimal Light', optimal_light, setOptimalLight, false)}
                    {getInput('salt_tolerance', 'Salt Tolerance', salt_tolerance, setSaltTolerance, false)}
                </div>
                <div className="third">
                    <p>Display Image</p>
                    {display_image}
                    <FileUpload selectText="Select" showFileName={false} showUploadButton={false} onUploadChange={fileSelectedHandler} />
                </div>
            </div>
            <div className="sku-info-div">
                <div className="half">
                    <InputText
                        label="Plant Code"
                        type="text"
                        value={code}
                        valueFunc={setCode}
                    />
                    {getInput('size', 'Size', size, setSize, false)}
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
                </div>
            </div>
            <Button onClick={savePlant}>Apply Changes</Button>
        </StyledPlantPopup>
    );
}

PlantPopup.propTypes = {
    session: PropTypes.object,
    sku: PropTypes.object.isRequired,
    trait_options: PropTypes.object,
}

export { PlantPopup };