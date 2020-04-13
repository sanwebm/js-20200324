export default class SortableTable {
  element;
  subElements = {};
  headersConfig = [];
  data = [];

  constructor(headersConfig, {
    data = []
  } = {}) {
    this.headersConfig = headersConfig;
    this.data = data;

    this.render();

  }

  sortData(field, order) {
    const { sortType } = this.headersConfig.find(item => item.id === field);
    let direction = order === 'asc' ? 1 : -1;

    return this.data.sort(function(a, b){
      switch(sortType){
        case 'number':
          return direction * (a[field] - b[field]);
        case 'string':
          return direction * a[field].localeCompare(b[field], 'default', {caseFirst: 'upper'});
        default:
          return direction * (a[field] - b[field]);
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
    `;
  }

  getSubElements(parentElement){
    console.log([...parentElement.querySelectorAll("[data-element]")]);
    return [...parentElement.querySelectorAll("[data-element]")].reduce(function(previousValue, item){
      previousValue[item.dataset.element] = item;
      return previousValue;
    }, {});
  }

  render() {

    const wrapper = document.createElement('div');
    wrapper.classList.add("sortable-table");

    wrapper.innerHTML = this.makeTable(this.data);
    this.element = wrapper;

    this.subElements = this.getSubElements(this.element);

  }

  sort (field, order) {
    let sortData = this.sortData(field, order);
    this.subElements.header.innerHTML = this.getTableHeaderRows(field, order);
    this.subElements.body.innerHTML = this.getTableBody(sortData);
  }

  remove() {
    this.element.remove();
  }

  destroy() {
    this.remove();
    this.subElements = {};
  }
}

