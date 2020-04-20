import fetchJson from "../../utils/fetch-json.js";

const BACKEND_URL = 'https://course-js.javascript.ru';

export default class SortableTable {
  element;
  subElements = {};
  data = [];
  pageSize = 30;

  onSortClick = event => {

    if (event.which !== 1) return;
    const clickedColumn = event.target.closest('[data-sortable="true"]');

    if (clickedColumn){
      let {id: field, order} = clickedColumn.dataset;

      if (!order) { order = 'asc'}
      else {
        order = order === 'asc' ? 'desc' : 'asc';
      }

      if (this.isSortLocally) {
        this.sortLocally(field, order);
      } else {
        this.sortOnServer(field, order);
      }
    }

  };

  sortLocally (field, order) {
    let sortData = this.sortData(field, order);
    this.subElements.header.innerHTML = this.getTableHeaderRows(field, order);
    this.subElements.body.innerHTML = this.getTableBody(sortData);
  }

  async sortOnServer(field, order){
    const sortData = await this.loadData(field, order);
    this.subElements.header.innerHTML = this.getTableHeaderRows(field, order);
    this.renderRows(sortData);
  }

  renderRows(data) {
    if (data.length) {
      this.element.classList.remove('sortable-table_empty');
      this.addRows(data);
    } else {
      this.element.classList.add('sortable-table_empty');
    }
  }

  addRows(data) {
    this.data = data;
    this.subElements.body.innerHTML = this.getTableBody(data);
  }

  constructor(headersConfig = [], {
    url = '',
    sorted = {
      id: headersConfig.find(item => item.sortable).id,
      order: 'asc'
    },
    isSortLocally = false
  } = {}) {

    this.headersConfig = headersConfig;
    this.url = new URL(url, BACKEND_URL);
    this.sorted = sorted;
    this.isSortLocally = isSortLocally;

    this.render();
  }

  async render() {
    const { id: field, order } = this.sorted;
    const wrapper = document.createElement('div');
    wrapper.classList.add("sortable-table");

    wrapper.innerHTML = this.makeTable(this.data);
    this.element = wrapper;

    this.subElements = this.getSubElements(this.element);

    const data = await this.loadData(field, order);

    this.renderRows(data);
    this.initEventListeners();
  }

  async loadData(id, order) {
    this.url.searchParams.set('_embed', `subcategory.category`);
    this.url.searchParams.set('_sort', id);
    this.url.searchParams.set('_order', order);
    this.url.searchParams.set('_start', 0);
    this.url.searchParams.set('_end', this.pageSize);

    this.element.classList.add('sortable-table_loading');
    let data = await fetchJson(this.url.href);
    this.element.classList.remove('sortable-table_loading');

    return data;
  }

  initEventListeners () {
    this.subElements.header.addEventListener('pointerdown', this.onSortClick);
  }

  sortData(id, order) {
    const arr = [...this.data];
    const column = this.headersConfig.find(item => item.id === id);
    const {sortType, customSorting} = column;
    const direction = order === 'asc' ? 1 : -1;

    return arr.sort((a, b) => {
      switch (sortType) {
        case 'number':
          return direction * (a[id] - b[id]);
        case 'string':
          return direction * a[id].localeCompare(b[id], 'ru');
        case 'custom':
          return direction * customSorting(a, b);
        default:
          return direction * (a[id] - b[id]);
      }
    });
  }

  getTableHeaderRows(field, order){
    return this.headersConfig
      .map( headersConfigItem => `
          <div class="sortable-table__cell" data-id="${headersConfigItem.id}" data-sortable="${headersConfigItem.sortable}" data-order="${field === headersConfigItem.id ? order : ''}">
            <span>${headersConfigItem.title}</span>

            ${ field === headersConfigItem.id ? '<span data-element="arrow" class="sortable-table__sort-arrow"><span class="sort-arrow"></span></span>' : ''}
          </div>

      `).join('');
  }

  getTableHeader(field, order){
    return `
      <div data-element="header" class="sortable-table__header sortable-table__row">
         ${this.getTableHeaderRows(field, order)} 
      </div>
    `;
  }

  getTableBodyRow(dataItem){
    let dataItemHTML = this.headersConfig.map( headersConfigItem => {
      return headersConfigItem.template
        ? headersConfigItem.template(dataItem[headersConfigItem.id])
        : `<div class="sortable-table__cell">${dataItem[headersConfigItem.id]}</div>`;
    }).join("");

    return `<a href="/products/${dataItem.id}" class="sortable-table__row">${dataItemHTML}</a>`;
  }

  getTableBody(data){
    return data.map(dataItem => this.getTableBodyRow(dataItem)).join("");

  }

  makeTable(){
    return `
      ${this.getTableHeader()}
      <div data-element="body" class="sortable-table__body">
        ${this.getTableBody(this.data)} 
      </div>
      
      <div data-element="loading" class="loading-line sortable-table__loading-line"></div>

      <div data-element="emptyPlaceholder" class="sortable-table__empty-placeholder">
        No products
      </div>
    `;
  }

  getSubElements(parentElement){
    return [...parentElement.querySelectorAll("[data-element]")].reduce(function(previousValue, item){
      previousValue[item.dataset.element] = item;
      return previousValue;
    }, {});
  }


  remove() {
    this.element.remove();
  }

  destroy() {
    this.remove();
    this.subElements = {};
  }
}
