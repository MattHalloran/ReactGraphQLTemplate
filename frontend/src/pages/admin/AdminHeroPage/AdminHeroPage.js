import { useCallback, useEffect, useState } from 'react';
import { Typography } from '@material-ui/core';
import { PUBS, PubSub } from 'utils';
import { makeStyles } from '@material-ui/styles';
import {
    AdminBreadcrumbs,
    ImageTable
} from 'components';
import { imagesByLabelQuery } from 'graphql/query';
import { addImageMutation } from 'graphql/mutation';
import { useQuery, useMutation } from '@apollo/client';
import Dropzone from 'components/Dropzone/Dropzone';

const useStyles = makeStyles((theme) => ({
    header: {
        textAlign: 'center',
    }
}));

function AdminHeroPage({
}) {
    const classes = useStyles();
    const [tableData, setTableData] = useState([]);
    const { data: currImages } = useQuery(imagesByLabelQuery, { variables: { label: 'hero', size: 'M' } });
    const [addImage] = useMutation(addImageMutation);

    const uploadImages = (acceptedFiles) => {
        PubSub.publish(PUBS.Loading, true);
        addImage({
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
        setTableData(currImages?.imagesByLabel?.map((d, index) => ({
            ...d,
            pos: index
        })));
    }, [currImages])

    const updateData = (data) => {
        console.log('updating image table', data)
        setTableData(data);
    }

    const applyChanges = useCallback(() => {
        let data = tableData.map(d => ({
            'id': d.key,
            'alt': d.alt,
            'description': d.description,
        }));
        // TODO
        // updateGallery(data);
    }, [tableData])

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
            <ImageTable
                title="Hero Images"
                data={tableData}
                onUpdate={updateData}
                onApply={applyChanges} />
        </div>
    );
}

AdminHeroPage.propTypes = {
}

export { AdminHeroPage };