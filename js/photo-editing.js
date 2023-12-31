import {onRadioEffectsChange, initEffects, resetEffects} from './effects.js';
import {resetScale} from './scale.js';

const modalElement = document.querySelector('.img-upload__overlay');
const effectRadioButtons = modalElement.querySelectorAll('.effects__radio');

//инициализация редактирования эффектов
const initEditing = () => {
  initEffects();
  effectRadioButtons.forEach((button) => {
    button.addEventListener('change', () => onRadioEffectsChange(button));
  });
};

//сброс значений эффектов
const resetEditing = () => {
  resetEffects();
  resetScale();
};

export {initEditing, resetEditing};
