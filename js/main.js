import {setPhotosContainer, setFilterClick} from './picture.js';
import {setPhotoFromSubmit, successPhotoSubmit} from './user-form.js';
import {getData} from './api.js';
import {debounce} from './util.js';
import {errorGetData} from './error-get-data.js';

const RERENDER_DELAY = 500;

//получить фото от сервера
getData()
  .then((photos) => {
    setPhotosContainer(photos);
    setFilterClick(debounce(
      (event) => setPhotosContainer(photos, event),
      RERENDER_DELAY,
    ));
  })
  .catch(errorGetData);

//отправить фото на сервер
setPhotoFromSubmit(successPhotoSubmit);
