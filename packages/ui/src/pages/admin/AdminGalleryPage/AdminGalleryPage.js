import React, { useCallback, useEffect, useState } from 'react';
import { Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import { imagesByLabelQuery } from 'graphql/query';
import { addImagesMutation, updateImagesMutation } from 'graphql/mutation';
import { useQuery, useMutation } from '@apollo/client';
import { 
    AdminBreadcrumbs, 
    Dropzone, 
    WrappedImageList 
} from 'components';
import { mutationWrapper } from 'graphql/utils/wrappers';
import { useTheme } from '@emotion/react';

const useStyles = makeStyles((theme) => ({
    header: {
        textAlign: 'center',
    }
}));

function AdminGalleryPage() {
    const classes = useStyles();
    const theme = useTheme();
    const [imageData, setImageData] = useState([]);
    const { data: currImages, refetch: refetchImages } = useQuery(imagesByLabelQuery, { variables: { label: 'gallery' } });
    const [addImages] = useMutation(addImagesMutation);
    const [updateImages] = useMutation(updateImagesMutation);

    const uploadImages = (acceptedFiles) => {
        mutationWrapper({
            mutation: addImages,
            data: { variables: { files: acceptedFiles, labels: ['gallery'] } },
            successMessage: () => `Successfully uploaded ${acceptedFiles.length} image(s).`,
            onSuccess: () => refetchImages(),
        })
    }

    useEffect(() => {
        console.log('CURR IMAGES UPDATTEEEEE')
        console.log(currImages);
        // Table data must be extensible, and needs position
        setImageData(currImages?.imagesByLabel?.map((d, index) => ({
            ...d,
            pos: index
        })));
    }, [currImages])

    const applyChanges = useCallback((changed) => {
        // Prepare data for request
        const data = changed.map(d => ({
            hash: d.hash,
            alt: d.alt,
            description: d.description
        }));
        // Determine which files to mark as deleting
        const originals = imageData.map(d => d.hash);
        const finals = changed.map(d => d.hash);
        const deleting = originals.filter(s => !finals.includes(s));
        // Perform update
        mutationWrapper({
            mutation: updateImages,
            data: { variables: { data, deleting, label: 'gallery' } },
            successMessage: () => 'Successfully updated image(s).',
        })
    }, [imageData, updateImages])

    return (
        <div id='page' className={classes.root}>
            <AdminBreadcrumbs textColor={theme.palette.primary.light} />
            <div className={classes.header}>
                <Typography variant="h3" component="h1">Manage Gallery</Typography>
            </div>
            <Dropzone
                dropzoneText={'Drag \'n\' drop new images here or click'}
                onUpload={uploadImages}
                uploadText='Upload Images'
            />
            <h2>Reorder and delete images</h2>
            <WrappedImageList data={imageData} onApply={applyChanges}/>
        </div>
    );
}

AdminGalleryPage.propTypes = {
}

export { AdminGalleryPage };