export default class ColumnChart{
  element;
  subElements = {};
  chartHeight = 50;

  constructor({
    data = [],
    label,
    link,
    value = 0
  }={}){
    this.data = data;
    this.label = label;
    this.link = link;
    this.value = value;

    this.render();
  }

  render(){
    const tempElement = document.createElement('div');
    tempElement.innerHTML = this.template;

    this.element = tempElement.firstElementChild;

    if (this.data.length) {
      this.element.classList.remove('column-chart_loading');
    }

    this.subElements = this.getSubElements(this.element);

    this.initEventListeners();
  }

  initEventListeners(){
    this.element.addEventListener("mouseover", this.onMouseOver);
    this.element.addEventListener("mouseout", this.onMouseOut);
  }

  onMouseOver = event => {
    const closest = event.target.closest('.column-chart__chart');
    if (!closest ) { return false}

    event.target.classList.add('is-hovered');
    closest.classList.add('has-hovered');

  };

  onMouseOut = event => {
    const closest = event.target.closest('.column-chart__chart');
    if (!closest ) { return false}

    event.target.classList.remove('is-hovered');
    closest.classList.remove('has-hovered');
  };

  get template () {
    return `
      <div class="column-chart column-chart_loading" style="--chart-height: ${this.chartHeight}">
        <div class="column-chart__title">
          Total ${this.label}
          ${this.getLink()}
        </div>
        <div class="column-chart__container">
          <div data-element="header" class="column-chart__header">
            ${this.value}
          </div>
          <div data-element="body" class="column-chart__chart">
            ${this.getColumnBody(this.data)}
          </div>
        </div>
      </div>
    `;
  }

  getColumnBody(data){
    const max = Math.max(...data);

    return data
      .map( item => {
        const scale = this.chartHeight / max;
        const percent = ( item / max *100).toFixed(0);
        const result = Math.floor(item * scale);

        return `<div style="--value: ${result}" data-tooltip="${percent}%"></div>`;
      })
      .join('');
  }

  getLink(){
    return this.link ? `<a href="${this.link}" class="column-chart__link">View all</a>` : '';
  }

  getSubElements(element){
    const elements = element.querySelectorAll('[data-element]');
    return [...elements].reduce( (accum, subElement) => {
      accum[subElement.dataset.element] = subElement;
      return accum;
    }, {});
  }

  update ({headerData, bodyData}) {
    this.subElements.header.textContent = headerData;
    this.subElements.body.innerHTML = this.getColumnBody(bodyData);
  }

  destroy() {
    this.element.remove();
  }
}
