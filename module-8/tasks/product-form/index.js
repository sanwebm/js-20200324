import escapeHtml from "../../utils/escape-html.js";
import fetchJson from "../../utils/fetch-json.js";

const IMGUR_CLIENT_ID = "28aaa2e823b03b1";
const BACKEND_URL = 'https://course-js.javascript.ru';

export default class ProductForm {
  element;
  subElements = {};
  defaultFormData = {
    title: '',
    description: '',
    quantity: 1,
    subcategory: '',
    status: 1,
    images: [],
    price: 100,
    discount: 0
  };

  uploadImage = () => {

    const { uploadImage, productForm, imageListContainer } = this.subElements;

    if (!this.inputTag) {
      uploadImage.insertAdjacentHTML('afterend',  `
        <input name="image" type="file" accept='image/*' hidden>
      `);

      this.inputTag = productForm.image;
    }

    this.inputTag.onchange = async () =>{
      const file = this.inputTag.files[0];

      if (file) {
        const formData = new FormData();

        formData.append('image', file);

        uploadImage.classList.add('is-loading');
        uploadImage.disabled = true;

        const result = await fetchJson('https://api.imgur.com/3/image', {
          method: 'POST',
          headers: {
            Authorization: `Client-ID ${IMGUR_CLIENT_ID}`
          },
          body: formData
        });

        imageListContainer.append(this.getImageTemplate(result.data.link, file.name));

        uploadImage.classList.remove('is-loading');
        uploadImage.disabled = false;

        this.inputTag.value = null;
      }
    };

    this.inputTag.click();


/*    const { uploadImage, fileInputList, imageListContainer } = this.subElements;


    console.log(imageListContainer);
    imageListContainer.insertAdjacentHTML('afterend',  `
    <input name="image" type="file" accept='image/!*' hidden multiple>
    `);

    const fileInput = this.createUploadImageInput();

    fileInput.addEventListener('change', event => {
      const [file] = event.target.files;
      const reader = new FileReader();

      reader.onload = ({ target }) => {
        imageListContainer.append(this.getImageTemplate(target.result, file.name));
      };

      reader.readAsDataURL(file);

      fileInputList.append(fileInput);
    });

    fileInput.click();*/
  };

  createUploadImageInput () {
    const wrapper = document.createElement('div');

    wrapper.innerHTML = `
      <input hidden name="images" type="file" accept="image/*">
    `;

    return wrapper.firstElementChild;
  }


  constructor (productId) {
    this.productId = productId;
  }

  createSelectFromCategories(){
    const wrapper = document.createElement('div');
    wrapper.innerHTML = `<select class="form-control" name="subcategory"></select>`;

    const select = wrapper.firstElementChild;
    this.formData.categories.map( item => {
      select.append(new Option(item.text, item.value));
    });

    return select.outerHTML;
  }

/*  createImagesList () {
    return this.formData.images.map(item => {
      return this.getImageItem(item.url, item.name).outerHTML;
    }).join('');
  }

  getImageItem (url, name) {
    const wrapper = document.createElement('div');

    wrapper.innerHTML = `
      <li class="products-edit__imagelist-item sortable-list__item">
        <span>
          <img src="./icon-grab.svg" data-grab-handle alt="grab">
          <img class="sortable-table__cell-img" alt="${escapeHtml(name)}" src="${escapeHtml(url)}">
          <span>${escapeHtml(name)}</span>
        </span>

        <button type="button">
          <img src="./icon-trash.svg" alt="delete" data-delete-handle>
        </button>
      </li>`;

    return wrapper.firstElementChild;
  }*/

  template () {
    return `
      <div class="product-form">

      <form data-element="productForm" class="form-grid">
        <div class="form-group form-group__half_left">
          <fieldset>
            <label class="form-label">Название товара</label>
            <input required
              value=""
              type="text"
              name="title"
              class="form-control"
              placeholder="Название товара">
          </fieldset>
        </div>

        <div class="form-group form-group__wide">
          <label class="form-label">Описание</label>
          <textarea required
            class="form-control"
            name="description"
            data-element="productDescription"
            placeholder="Описание товара"></textarea>
        </div>

        <div class="form-group form-group__wide" data-element="sortable-list-container">
          <label class="form-label">Фото</label>

          <ul class="sortable-list" data-element="imageListContainer">
            ${this.createImagesList()}
          </ul>

          <button data-element="uploadImage" type="button" class="button-primary-outline">
            <span>Загрузить</span>
          </button>
        </div>

        <div class="form-group form-group__half_left">
          <label class="form-label">Категория</label>
            ${this.createCategoriesSelect()}
        </div>

        <div class="form-group form-group__half_left form-group__two-col">
          <fieldset>
            <label class="form-label">Цена ($)</label>
            <input required
              value=""
              type="number"
              name="price"
              class="form-control"
              placeholder="${this.defaultFormData.price}">
          </fieldset>
          <fieldset>
            <label class="form-label">Скидка ($)</label>
            <input required
              value=""
              type="number"
              name="discount"
              class="form-control"
              placeholder="${this.defaultFormData.discount}">
          </fieldset>
        </div>

        <div class="form-group form-group__part-half">
          <label class="form-label">Количество</label>
          <input required
            value=""
            type="number"
            class="form-control"
            name="quantity"
            placeholder="${this.defaultFormData.quantity}">
        </div>

        <div class="form-group form-group__part-half">
          <label class="form-label">Статус</label>
          <select class="form-control" name="status">
            <option value="1">Активен</option>
            <option value="0">Неактивен</option>
          </select>
        </div>

        <div class="form-buttons">
          <button type="submit" name="save" class="button-primary-outline">
            ${this.productId ? "Сохранить" : "Добавить"} товар
          </button>
        </div>
      </form>
    </div>
    `;
  }

  async render () {
    const categories = this.getCategories();
    const product = this.productId
      ? this.getProduct(this.productId)
      : Promise.resolve( [this.defaultFormData] );

    const [categoriesData, productData] = await Promise.all([categories, product]);
    const [productDataObj] = productData;

    this.categories = categoriesData;
    this.formData = productDataObj;

    this.renderForm();
    this.setFormData();

    this.initEventListeners();
  }

  renderForm() {
    const element = document.createElement('div');

    element.innerHTML = this.formData
      ? this.template()
      : this.noProductTemplate();

    this.element = element.firstElementChild;
    this.subElements = this.getSubElements(element);
  }

  createImagesList(){
    return this.formData.images.map( image => {
      return this.getImageTemplate(image.url, image.source).outerHTML;
    }).join('');
  }

  getImageTemplate(url,name){
    const wrapper = document.createElement('div');
    wrapper.innerHTML = `
      <li class="products-edit__imagelist-item sortable-list__item">
        <span>
          <img src="./icon-grab.svg" data-grab-handle alt="grab">
          <img class="sortable-table__cell-img" alt="${escapeHtml(name)}" src="${escapeHtml(url)}">
          <span>${escapeHtml(name)}</span>
        </span>

        <button type="button">
          <img src="./icon-trash.svg" alt="delete" data-delete-handle>
        </button>
      </li>`;

    return wrapper.firstElementChild;
  }

  noProductTemplate() {
    return `<div>
      <h1 class="page-title">Нет такого товара</h1>
    </div>`
  }


  async getCategories(){
    return await fetchJson(`${BACKEND_URL}/api/rest/categories?_sort=weight&_refs=subcategory`);
  }

  async getProduct(productId){
    return await fetchJson(`${BACKEND_URL}/api/rest/products?id=${productId}`);
  }

  setFormData(){
    const { productForm } = this.subElements;

    [...Object.keys(this.defaultFormData)].map( item =>{
      if(item !== 'images') {
        productForm[item].value = this.formData[item] || this.defaultFormData[item];
      }
    });


  }

  createCategoriesSelect(){
    const wrapper = document.createElement('div');
    wrapper.innerHTML = `<select class="form-control" name="subcategory"></select>`;

    const select = wrapper.firstElementChild;

    for (const category of this.categories) {
      for (const child of category.subcategories) {
        select.append(new Option(`${category.title} > ${child.title}`, child.id));
      }
    }

    return select.outerHTML;
  }

  getSubElements(element) {
    const elements = element.querySelectorAll('[data-element]');

    return [...elements].reduce((accum, subElement) => {
      accum[subElement.dataset.element] = subElement;

      return accum;
    }, {});
  }

  initEventListeners() {
    const { productForm, uploadImage, imageListContainer } = this.subElements;

    productForm.addEventListener('submit', this.onSubmit);
    uploadImage.addEventListener('click', this.uploadImage);

    imageListContainer.addEventListener('click', event => {
      if ('deleteHandle' in event.target.dataset) {
        event.target.closest('li').remove();
      }
    });

  }

  onSubmit = event => {
    event.preventDefault();
    this.upload();
    //this.dispatchEvent();
  };

  async upload() {
    const product = this.getFormData();

    try {
      const result = await fetchJson(`${BACKEND_URL}/api/rest/products`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(product)
      });
      this.dispatchEvent(result.id);
    } catch {
      throw new Error('Error onSubmit with sanding data');
    }
  }

  dispatchEvent(id) {
    const event = this.productId
      ? new CustomEvent('product-updated', { detail: id })
      : new CustomEvent('product-saved', { detail: id });

    this.element.dispatchEvent(event);
  }

  getFormData(){
    const { productForm, imageListContainer } = this.subElements;

    const resultObject = {};
          resultObject.id = this.productId;
          resultObject.images = [];

    const makeNumbersForJSON = ['price', 'quantity', 'discount', 'status'];
    const keys = [...Object.keys(this.defaultFormData)];

    keys.map( item =>{
      if(item !== 'images') {
        resultObject[item] = makeNumbersForJSON.includes(item)
        ? parseInt(productForm[item].value)
        : productForm[item].value;
      }
    });

    const imageElements = [...imageListContainer.querySelectorAll('.sortable-table__cell-img')];

    imageElements.map( image => {
      resultObject.images.push({
        url: image.src,
        source: image.alt
      });
    });

    return resultObject;
  }

  destroy () {
    this.remove();
    this.element = null;
    this.subElements = null;
  }

  remove () {
    this.element.remove();
  }
}
