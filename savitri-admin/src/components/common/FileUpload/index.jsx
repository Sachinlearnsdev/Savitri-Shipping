import { useRef, useState } from 'react';
import { formatBytes } from '../../../utils/formatters';
import styles from './FileUpload.module.css';

/**
 * FileUpload Component
 * 
 * @param {object} props - Component props
 * @param {string} props.label - Upload label
 * @param {Function} props.onChange - Change handler
 * @param {Array<string>} props.accept - Accepted file types
 * @param {number} props.maxSize - Maximum file size in bytes
 * @param {boolean} props.multiple - Allow multiple files
 * @param {boolean} props.disabled - Whether upload is disabled
 * @param {string} props.error - Error message
 * @param {boolean} props.showPreview - Show file preview
 */
const FileUpload = ({
  label,
  onChange,
  accept = [],
  maxSize = 5 * 1024 * 1024, // 5MB default
  multiple = false,
  disabled = false,
  error,
  showPreview = true,
  className = '',
}) => {
  const inputRef = useRef(null);
  const [files, setFiles] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  
  const wrapperClasses = [
    styles.wrapper,
    disabled && styles.disabled,
    error && styles.hasError,
    className,
  ].filter(Boolean).join(' ');
  
  const dropzoneClasses = [
    styles.dropzone,
    isDragging && styles.dragging,
  ].filter(Boolean).join(' ');
  
  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files || []);
    processFiles(selectedFiles);
  };
  
  const processFiles = (selectedFiles) => {
    const validFiles = selectedFiles.filter(file => {
      // Check file size
      if (file.size > maxSize) {
        console.error(`File ${file.name} exceeds maximum size of ${formatBytes(maxSize)}`);
        return false;
      }
      
      // Check file type
      if (accept.length > 0 && !accept.includes(file.type)) {
        console.error(`File ${file.name} type is not accepted`);
        return false;
      }
      
      return true;
    });
    
    if (validFiles.length > 0) {
      setFiles(multiple ? validFiles : [validFiles[0]]);
      if (onChange) {
        onChange(multiple ? validFiles : validFiles[0]);
      }
    }
  };
  
  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) {
      setIsDragging(true);
    }
  };
  
  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };
  
  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };
  
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    if (!disabled) {
      const droppedFiles = Array.from(e.dataTransfer.files);
      processFiles(droppedFiles);
    }
  };
  
  const handleClick = () => {
    if (!disabled && inputRef.current) {
      inputRef.current.click();
    }
  };
  
  const handleRemoveFile = (index) => {
    const newFiles = files.filter((_, i) => i !== index);
    setFiles(newFiles);
    if (onChange) {
      onChange(multiple ? newFiles : null);
    }
  };
  
  return (
    <div className={wrapperClasses}>
      {label && (
        <label className={styles.label}>{label}</label>
      )}
      
      <div
        className={dropzoneClasses}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        <input
          ref={inputRef}
          type="file"
          className={styles.input}
          onChange={handleFileChange}
          accept={accept.join(',')}
          multiple={multiple}
          disabled={disabled}
        />
        
        <div className={styles.content}>
          <span className={styles.icon}>📁</span>
          <p className={styles.text}>
            <span className={styles.highlight}>Click to upload</span> or drag and drop
          </p>
          <p className={styles.hint}>
            {accept.length > 0 && `Accepted: ${accept.map(t => t.split('/')[1]).join(', ')} • `}
            Max size: {formatBytes(maxSize)}
          </p>
        </div>
      </div>
      
      {showPreview && files.length > 0 && (
        <div className={styles.preview}>
          {files.map((file, index) => (
            <div key={index} className={styles.fileItem}>
              <div className={styles.fileInfo}>
                <span className={styles.fileName}>{file.name}</span>
                <span className={styles.fileSize}>{formatBytes(file.size)}</span>
              </div>
              <button
                type="button"
                className={styles.removeButton}
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemoveFile(index);
                }}
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}
      
      {error && (
        <span className={styles.error}>{error}</span>
      )}
    </div>
  );
};

export default FileUpload;