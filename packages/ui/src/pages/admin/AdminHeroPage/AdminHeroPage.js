import { useCallback, useEffect, useState } from 'react';
import {
    Typography
} from '@material-ui/core';
import { PUBS, PubSub } from 'utils';
import { makeStyles } from '@material-ui/styles';
import { AdminBreadcrumbs } from 'components';
import { imagesByLabelQuery } from 'graphql/query';
import { addImagesMutation, updateImagesMutation } from 'graphql/mutation';
import { useQuery, useMutation } from '@apollo/client';
import Dropzone from 'components/Dropzone/Dropzone';
import { ImageList } from 'components/lists/ImageList/ImageList';

const useStyles = makeStyles((theme) => ({
    header: {
        textAlign: 'center',
    },
}));

function AdminHeroPage() {
    const classes = useStyles();
    const [imageData, setImageData] = useState([]);
    const { data: currImages } = useQuery(imagesByLabelQuery, { variables: { label: 'hero', size: 'M' } });
    const [addImages] = useMutation(addImagesMutation);
    const [updateImages] = useMutation(updateImagesMutation);

    const uploadImages = (acceptedFiles) => {
        PubSub.publish(PUBS.Loading, true);
        addImages({
            variables: {
                files: acceptedFiles,
                labels: ['hero']
            }
        })
        .then((response) => {
            console.log('GOT ADD IMAGE RESPONSE', response);
            PubSub.publish(PUBS.Snack, { message: `Successfully uploaded ${acceptedFiles.length} image(s)` });
            PubSub.publish(PUBS.Loading, false);
        })
        .catch((response) => {
            console.error(response);
            PubSub.publish(PUBS.Loading, false);
            PubSub.publish(PUBS.Snack, { message: response.message ?? 'Unknown error occurred', severity: 'error' });
        })
    }

    useEffect(() => {
        // Table data must be extensible, and needs position
        setImageData(currImages?.imagesByLabel?.map((d, index) => ({
            ...d,
            pos: index
        })));
    }, [currImages])

    const applyChanges = useCallback((changed) => {
        PubSub.publish(PUBS.Loading, true);
        // Prepare data for request
        const data = changed.map(d => ({
            src: d.src,
            alt: d.alt,
            description: d.description
        }));
        // Determine which files to mark as deleting
        const original_srcs = imageData.map(d => d.src);
        const final_srcs = changed.map(d => d.src);
        const delete_srcs = original_srcs.filter(s => !final_srcs.includes(s));
        // Perform update
        updateImages({
            variables: {
                data: data,
                deleting: delete_srcs
            }
        })
        .then((response) => {
            console.log('GOT UPDATE IMAGE RESPONSE', response);
            PubSub.publish(PUBS.Snack, { message: `Successfully updated images` });
            PubSub.publish(PUBS.Loading, false);
        })
        .catch((response) => {
            console.error(response);
            PubSub.publish(PUBS.Loading, false);
            PubSub.publish(PUBS.Snack, { message: response.message ?? 'Unknown error occurred', severity: 'error' });
        })
    }, [imageData])

    return (
        <div id='page' className={classes.root}>
            <AdminBreadcrumbs />
            <div className={classes.header}>
                <Typography variant="h3" component="h1">Hero Edit</Typography>
            </div>
            <Dropzone
                dropzoneText={'Drag \'n\' drop new images here or click'}
                onUpload={uploadImages}
                uploadText='Upload Images'
                cancelText='Cancel Upload'
            />
            <h2>Reorder and delete images</h2>
            <ImageList data={imageData} onApply={applyChanges}/>
        </div>
    );
}

AdminHeroPage.propTypes = {
}

export { AdminHeroPage };