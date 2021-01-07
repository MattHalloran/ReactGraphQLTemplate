import React from 'react';
import PropTypes from 'prop-types';
import { StyledGalleryPhoto } from './GalleryPhoto.styled';
import { SortableElement } from 'react-sortable-hoc';

function GalleryPhoto(props) {

    const handleClick = (event) => {
        props.handleClick(event, props.photo, props.index);
    }

    return (
        <StyledGalleryPhoto {...props} 
            onClick={handleClick} 
            src={props.photo.src}
            width={props.photo.width}
            height={props.photo.height} />
    );
}

GalleryPhoto.propTypes = {
    index: PropTypes.number,
    onClick: PropTypes.func,
    photo: PropTypes.object,
    margin: PropTypes.number,
    direction: PropTypes.oneOf(['column', 'row']),
    top: PropTypes.number,
    left: PropTypes.number,
}

export default GalleryPhoto;

export const SortableGalleryPhoto = SortableElement(props => <GalleryPhoto {...props} />);