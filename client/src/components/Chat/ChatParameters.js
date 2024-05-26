// src/components/Chat/ChatParameters.js
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { updateChatParameters } from '../../store/chatSlice';
import styles from './styles/ChatParameters.module.css';

const ChatParameters = ({ chatId, onClose }) => {
  const dispatch = useDispatch();
  const model = useSelector((state) => state.chat.model);
  const tokenLimit = useSelector((state) => state.chat.tokenLimit);
  const temperature = useSelector((state) => state.chat.temperature);
  const topP = useSelector((state) => state.chat.topP);
  const frequencyPenalty = useSelector((state) => state.chat.frequencyPenalty);

  const [selectedModel, setSelectedModel] = useState(model);
  const [selectedTokenLimit, setSelectedTokenLimit] = useState(tokenLimit);
  const [selectedTemperature, setSelectedTemperature] = useState(temperature);
  const [selectedTopP, setSelectedTopP] = useState(topP);
  const [selectedFrequencyPenalty, setSelectedFrequencyPenalty] = useState(frequencyPenalty);

  useEffect(() => {
    setSelectedModel(model);
    setSelectedTokenLimit(tokenLimit);
    setSelectedTemperature(temperature);
    setSelectedTopP(topP);
    setSelectedFrequencyPenalty(frequencyPenalty);
  }, [model, tokenLimit, temperature, topP, frequencyPenalty]);

  const handleModelChange = (e) => {
    setSelectedModel(e.target.value);
  };

  const handleTokenLimitChange = (e) => {
    setSelectedTokenLimit(e.target.value);
  };

  const handleTemperatureChange = (e) => {
    setSelectedTemperature(e.target.value);
  };

  const handleTopPChange = (e) => {
    setSelectedTopP(e.target.value);
  };

  const handleFrequencyPenaltyChange = (e) => {
    setSelectedFrequencyPenalty(e.target.value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(updateChatParameters({ 
      chatId, 
      model: selectedModel, 
      tokenLimit: selectedTokenLimit, 
      temperature: selectedTemperature, 
      topP: selectedTopP, 
      frequencyPenalty: selectedFrequencyPenalty 
    }));
    onClose();
  };

  return (
    <>
      <div className={styles.overlay} onClick={onClose} />
      <div className={styles.modal}>
        <button className={styles.closeButton} onClick={onClose}>✕</button>
        <form className={styles.form} onSubmit={handleSubmit}>
          <label className={styles.label}>
            Model
            <select className={`${styles.input} ${styles.select}`} value={selectedModel} onChange={handleModelChange}>
              <option value="claude-3-opus-20240229">claude-3-opus-20240229</option>
              <option value="claude-3-sonnet-20240229">claude-3-sonnet-20240229</option>
              <option value="claude-3-haiku-20240307">claude-3-haiku-20240307</option>
              <option value="gpt-4o">gpt-4o</option>
              <option value="gpt-4">gpt-4</option>
              <option value="gpt-4-0613">gpt-4-0613</option>
              <option value="gpt-4-turbo">gpt-4-turbo</option>
              <option value="gpt-4-1106-preview">gpt-4-1106-preview</option>
              <option value="gpt-4-vision-preview">gpt-4-vision-preview</option> 
              <option value="gpt-4-0125-preview">gpt-4-0125-preview</option>
              <option value="gpt-3.5-turbo-16k">gpt-3.5-turbo-16k</option>
              <option value="gpt-4-32k-0613">gpt-4-32k-0613</option>
              <option value="dall-e-3">dall-e-3</option>
            </select>
          </label>
          <label className={styles.label}>
            Input Token Limit (gpt-4 best around 6500-7000)
            <input className={styles.input} value={selectedTokenLimit} onChange={handleTokenLimitChange} />
          </label>
          <label className={styles.label}>
            Temperature (0.00 - 2.00)
            <input className={styles.input} value={selectedTemperature} onChange={handleTemperatureChange} />
          </label>
          <label className={styles.label}>
            Top P (0.00 - 1.00)
            <input className={styles.input} value={selectedTopP} onChange={handleTopPChange} />
          </label>
          <label className={styles.label}>
            Frequency Penalty (0.00 - 1.00)
            <input className={styles.input} value={selectedFrequencyPenalty} onChange={handleFrequencyPenaltyChange} />
          </label>
          <div className={styles.buttonContainer}>
            <button type="submit" className={styles.sendButton}>Confirm</button>
          </div>
        </form>
      </div>
    </>
  );
};

export default ChatParameters;