import React from 'react';
import Carousel from 'react-gallery-carousel';
import 'react-gallery-carousel/dist/index.css';
import { InformationalBreadcrumbs } from 'components';
import { PUBS, PubSub } from 'utils';
import { makeStyles } from '@material-ui/styles';
import { imagesByLabelQuery } from 'graphql/query';
import { useQuery } from '@apollo/client';

const useStyles = makeStyles(() => ({
    imageList: {
        spacing: 0,
    },
    tileImg: {

    },
    popupMain: {
        display: 'flex',
        width: '100%',
        height: '100%',
    },
    popupImg: {
        maxHeight: '90vh',
        maxWidth: '100%',
        display: 'block',
        borderRadius: '10px',
        objectFit: 'contain',
    },
    carousel: {
        width: '100%',
        height: 'calc(100vw * 0.8)'
    }
}));

function GalleryPage() {
    const classes = useStyles();
    const { data: images, error } = useQuery(imagesByLabelQuery, { variables: { label: 'gallery', size: 'L' } });

    if (error) PubSub.publish(PUBS.Snack, { message: error.message ?? 'Unknown error occurred', severity: 'error', data: error });

    // useHotkeys('escape', () => setCurrImg([null, null]));
    // useHotkeys('arrowLeft', () => navigate(-1));
    // useHotkeys('arrowRight', () => navigate(1));

    return (
        <div id='page'>
            <InformationalBreadcrumbs />
            <Carousel className={classes.carousel} canAutoPlay={false} images={images?.imagesByLabel ?? []} />
        </div>
    );
}

GalleryPage.propTypes = {
}

export { GalleryPage };