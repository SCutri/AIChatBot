// src/components/Chat/CustomInstructions.js
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { updateCustomInstructions } from '../../store/chatSlice';
import styles from './styles/CustomInstructions.module.css';

const CustomInstructions = ({ chatId, onClose }) => {
  const dispatch = useDispatch();
  const projectInfo = useSelector((state) => state.chat.projectInfo);
  const responseInfo = useSelector((state) => state.chat.responseInfo);

  const [projectInstruction, setProjectInstruction] = useState(projectInfo);
  const [responseInstruction, setResponseInstruction] = useState(responseInfo);

  useEffect(() => {
    setProjectInstruction(projectInfo);
    setResponseInstruction(responseInfo);
  }, [projectInfo, responseInfo]);

  const handleProjectInstructionChange = (e) => {
    setProjectInstruction(e.target.value);
  };

  const handleResponseInstructionChange = (e) => {
    setResponseInstruction(e.target.value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(updateCustomInstructions({ chatId, projectInfo: projectInstruction, responseInfo: responseInstruction }));
    onClose();
  };

  return (
    <>
      <div className={styles.overlay} onClick={onClose} />
      <div className={styles.modal}>
        <button className={styles.closeButton} onClick={onClose}>✕</button>
        <form className={styles.form} onSubmit={handleSubmit}>
          <label className={styles.label}>
            What do you want GPT to know about your current situation?
            <textarea className={styles.input} value={projectInstruction} onChange={handleProjectInstructionChange} />
          </label>
          <label className={styles.label}>
            How do you want GPT to respond?
            <textarea className={styles.input} value={responseInstruction} onChange={handleResponseInstructionChange} />
          </label>
          <div className={styles.buttonContainer}>
            <button type="submit" className={styles.sendButton}>Confirm</button>
          </div>
        </form>
      </div>
    </>
  );
};

export default CustomInstructions;