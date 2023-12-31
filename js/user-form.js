import {isEscapeKey} from './util.js';
import {COUNT_HASHTAGS, MAX_DESCRIPTION, validateCountWords, validateDuplicateWords, validateHashtags, validateTextLength, isValidFormatFile} from './validation.js';
import {onScaleSmallerClick, onScaleBiggerClick} from './scale.js';
import {initEditing, resetEditing} from './photo-editing.js';
import {sendData} from './api.js';
import {errorSendData} from './error-send-data.js';
import {showSuccess} from './success.js';

const SubmitButtonText = {
  IDLE: 'Опубликовать',
  SENDING: 'Публикую...'
};

const body = document.querySelector('body');
const imageUploadInput = document.querySelector('.img-upload__input');
const modalUploadPhoto = document.querySelector('.img-upload__overlay');
const buttonScaleSmaller = modalUploadPhoto.querySelector('.scale__control--smaller');
const buttonScaleBigger = modalUploadPhoto.querySelector('.scale__control--bigger');
const buttonModalClose = document.querySelector('.img-upload__cancel');
const uploadForm = document.querySelector('.img-upload__form');
const inputHashtags = uploadForm.querySelector('.text__hashtags');
const inputDescription = uploadForm.querySelector('.text__description');
const submitButton = uploadForm.querySelector('.img-upload__submit');
const imageElement = uploadForm.querySelector('.img-upload__preview > img');
const effectsPreview = uploadForm.querySelectorAll('.effects__preview');

let urlPhoto = null;

//блокировка/разблокировка кнопки опубликовать
const toggleSubmitButton = (disabled, text) => {
  submitButton.disabled = disabled;
  submitButton.textContent = text;
};

//нажать кнопку загрузить изображение
imageUploadInput.addEventListener('change', function () {
  const file = this.files[0];
  if (file && isValidFormatFile(file)) {
    urlPhoto = URL.createObjectURL(file);
    imageElement.src = urlPhoto;
    effectsPreview.forEach((element) => {
      element.style.backgroundImage = `url('${urlPhoto}')`;
    });
    modalUploadPhoto.classList.remove('hidden');
    body.classList.add('modal-open');
    initEditing();
  }
});

//инициализация библиотеки pristine
const pristine = new Pristine(uploadForm, {
  classTo: 'img-upload__field-wrapper',
  errorClass: 'img-upload__field-wrapper--error',
  errorTextParent: 'img-upload__field-wrapper',
  errorTextTag: 'div',
  errorTextClass: 'img-upload__error',
});

const resetFormData = () => {
  imageUploadInput.value = '';
  inputHashtags.value = '';
  inputDescription.value = '';
  pristine.reset();
  resetEditing();
};

//событие закрыть модальное окно по клику
const onCloseUserModalClick = () => {
  if (!modalUploadPhoto.classList.contains('hidden')) {
    modalUploadPhoto.classList.add('hidden');
    body.classList.remove('modal-open');
    resetFormData();
    URL.revokeObjectURL(urlPhoto);
  }
};

//закрыть модальное окно
const closeUserModal = () => {
  if (!modalUploadPhoto.classList.contains('hidden')) {
    modalUploadPhoto.classList.add('hidden');
    body.classList.remove('modal-open');
    resetFormData();
    URL.revokeObjectURL(urlPhoto);
  }
};

//при нажатии Esc закрывается модальное окно
const onDocumentKeydown = (event) => {
  const errorModal = document.querySelector('.error');
  if (isEscapeKey(event) && document.activeElement !== inputHashtags && document.activeElement !== inputDescription && !errorModal) {
    event.preventDefault();
    closeUserModal();
  }
};

//кнопки изменить масштаб
buttonScaleSmaller.addEventListener('click', onScaleSmallerClick);
buttonScaleBigger.addEventListener('click', onScaleBiggerClick);

//закрыть модальное окно по кнопке Закрыть
buttonModalClose.addEventListener('click', onCloseUserModalClick);
document.addEventListener('keydown', onDocumentKeydown);

pristine.addValidator(
  inputHashtags,
  validateHashtags,
  'Введён невалидный хэш-тег',
  1,
  true
);

pristine.addValidator(
  inputHashtags,
  validateCountWords,
  `Количество хэш-тегов не должно быть больше ${COUNT_HASHTAGS}`,
  2,
  true
);

pristine.addValidator(
  inputHashtags,
  validateDuplicateWords,
  'Хэш-теги не должны повторяться',
  3,
  true
);

pristine.addValidator(
  inputDescription,
  validateTextLength,
  `Максимальная длина ${MAX_DESCRIPTION} символов`,
  4,
  true);

//отправить фото и описание на сервер
const setPhotoFromSubmit = (onSuccess) => {
  uploadForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const isValid = pristine.validate();
    if (isValid) {
      toggleSubmitButton(true, SubmitButtonText.SENDING);
      sendData(new FormData(event.target))
        .then((response) => {
          if (typeof response !== 'undefined') {
            onSuccess();
          }
        })
        .catch(errorSendData)
        .finally(() => toggleSubmitButton(false, SubmitButtonText.IDLE));
    }
  });
};

//успешная отправка сообщений
const successPhotoSubmit = () => {
  closeUserModal();
  showSuccess();
};

export {setPhotoFromSubmit, successPhotoSubmit};
