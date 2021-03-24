import { useState, useRef } from 'react';
import PropTypes from 'prop-types';
import { StyledFileUpload } from './FileUpload.styled';
import Button from 'components/Button/Button';

function FileUpload({
    selectText = 'Select File',
    uploadText = 'Upload File',
    onUploadClick,
    onUploadChange,
    showFileName = true,
    showUploadButton = true,
    ...props
}) {
    const [uploadState, setUploadState] = useState('');
    const numSelected = useRef(0);
    const inputRef = useRef();

    const fileUploadAction = () => inputRef.current.click();

    const fileUploadInputChange = (e) => {
        numSelected.current = e.target.files.length;
        if (!showFileName || numSelected.current > 1) {
            setUploadState(`${numSelected.current} files`)
        } else {
            setUploadState(e.target.value);
        }
        onUploadChange(e);
    }

    return (
        <StyledFileUpload>
            <input type="file" hidden ref={inputRef} onChange={fileUploadInputChange} {...props}/>
            <Button onClick={fileUploadAction}>{selectText}</Button>
            {uploadState}
            {showUploadButton && numSelected.current > 0 ? <Button onClick={onUploadClick}>{uploadText}</Button> : null}
        </StyledFileUpload >
    );
}

FileUpload.propTypes = {
    theme: PropTypes.object,
    noFilesText: PropTypes.string,
    filesText: PropTypes.string,
    showFileName: PropTypes.bool,
    showUploadButton: PropTypes.bool,
    onButtonClick: PropTypes.func.isRequired,
    onUploadChange: PropTypes.func.isRequired,
}

export default FileUpload;