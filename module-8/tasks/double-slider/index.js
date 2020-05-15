export default class DoubleSlider {
  element;
  subElements = {};

  constructor ({
     min = 100,
     max = 200,
     formatValue = value => '$' + value,
     selected = {
       from: 150,
       to: 180
     }
   } = {}) {
    this.min = min;
    this.max = max;
    this.formatValue = formatValue;
    this.selected = selected;

    this.render();
  }

  get template () {
    return `
      <div class="range-slider">
        <span data-element="from"></span>
        <div data-element="inner" class="range-slider__inner">
          <span data-element="progress" class="range-slider__progress" style="left: 0%; right: 0%"></span>
          <span data-element="thumbLeft" class="range-slider__thumb-left" style="left: 0%"></span>
          <span data-element="thumbRight" class="range-slider__thumb-right" style="right: 0%"></span>
        </div>
        <span data-element="to"></span>
      </div>`;
  }

  render() {
    const tempElement = document.createElement('div');
    tempElement.innerHTML = this.template;
    this.element = tempElement.firstElementChild;
    this.subElements = this.getSubElements(tempElement);

    // To init shift in default state
    this.shiftX = 0;

    this.update();
    this.initEventListeners();
  }

  update(){
    const range = this.max - this.min;
    let leftShiftPercent = Math.floor((this.selected.from - this.min) * 100 / range) + '%';
    let rightShiftPercent = Math.floor((this.max - this.selected.to) * 100 / range) + '%';

    this.subElements.progress.style.left = leftShiftPercent;
    this.subElements.progress.style.right = rightShiftPercent;

    this.subElements.thumbLeft.style.left = leftShiftPercent;
    this.subElements.thumbRight.style.right = rightShiftPercent;

    this.subElements.from.innerHTML = this.formatValue(this.selected.from);
    this.subElements.to.innerHTML = this.formatValue(this.selected.to);

  }

  initEventListeners () {
    this.element.ondragstart = function () { return false };

    this.subElements.thumbLeft.addEventListener('pointerdown', this.onThumbPointerDown);
    this.subElements.thumbRight.addEventListener('pointerdown', this.onThumbPointerDown);
    this.subElements.inner.addEventListener('pointerdown', this.onInnerPointerDown);
  }

  onInnerPointerDown = event => {

    event.preventDefault();

    const { target } = event;
    const { thumbLeft, thumbRight } = this.subElements;

    if ( !target.closest('.range-slider') ) { return false }

    if ( target === thumbLeft || target === thumbRight ) { return false }

    const rectThumbLeft = thumbLeft.getBoundingClientRect();
    const rectThumbRight = thumbRight.getBoundingClientRect();

    const clientX = event.clientX;

    if ( clientX < rectThumbLeft.left ){
      this.draggingElement = thumbLeft;
      this.onDraggingThumbLeft(event);
    }
    else if ( clientX > rectThumbRight.right ) {
      this.draggingElement = thumbRight;
      this.onDraggingThumbRight(event);
    }
    else if ( clientX > rectThumbLeft.right && clientX < rectThumbRight.left ) {

      const halfRange = ( rectThumbRight.left - rectThumbLeft.right ) / 2 ;

      if ( clientX <= halfRange ) {
        this.draggingElement = thumbLeft;
        this.onDraggingThumbLeft(event);
      }
      else {
        this.draggingElement = thumbRight;
        this.onDraggingThumbRight(event);
      }
    }
  };

  onThumbPointerDown = event =>{
    event.preventDefault();

    if (!event.target.closest('.range-slider')) { return false }

    const rect = event.target.getBoundingClientRect();
    event.target === this.subElements.thumbLeft
      ? this.shiftX = rect.right - event.clientX
      : this.shiftX = rect.left - event.clientX;

    this.draggingElement = event.target;
    this.draggingElement.classList.add('range-slider_dragging');

    document.addEventListener('pointermove', this.onThumbPointerMove);
    document.addEventListener('pointerup', this.onThumbPointerUp);

  };

  onThumbPointerMove = event => {
    event.preventDefault();

    this.draggingElement === this.subElements.thumbLeft
      ? this.onDraggingThumbLeft(event)
      : this.onDraggingThumbRight(event);

  };

  onThumbPointerUp = event => {
    event.preventDefault();

    this.element.classList.remove('range-slider_dragging');

    document.removeEventListener("pointermove", this.onThumbPointerMove);
    document.removeEventListener("pointerup", this.onThumbPointerUp);

  };

  onDraggingThumbLeft = event => {
    let rect = this.subElements.inner.getBoundingClientRect();

    let coordinate = (event.clientX - pageXOffset - rect.left + this.shiftX);
    let coordinatePercent = (coordinate / this.subElements.inner.offsetWidth ) * 100;

    if (coordinatePercent < 0 ) { coordinatePercent = 0 }

    let rightThumbPercent = parseFloat(this.subElements.thumbRight.style.right);

    if (coordinatePercent + rightThumbPercent > 100) {
      coordinatePercent = 100 - rightThumbPercent;
    }

    this.draggingElement.style.left = this.subElements.progress.style.left = coordinatePercent + '%';
    this.subElements.from.innerHTML = this.formatValue( this.getFromTo().from );
  };

  onDraggingThumbRight = event => {
    let rect = this.subElements.inner.getBoundingClientRect();

    let coordinate = (rect.right - pageXOffset - event.clientX - this.shiftX);
    let coordinatePercent = (coordinate / this.subElements.inner.offsetWidth) * 100;

    if (coordinatePercent < 0 ) { coordinatePercent = 0 }

    let leftThumbPercent = parseFloat(this.subElements.thumbLeft.style.left);

    if ( leftThumbPercent + coordinatePercent > 100) {
      coordinatePercent = 100 - leftThumbPercent;
    }

    this.draggingElement.style.right = this.subElements.progress.style.right = coordinatePercent + '%';
    this.subElements.to.innerHTML = this.formatValue( this.getFromTo().to );
  };

  getFromTo (){
    const range = this.max-this.min;
    return {
      from: Math.round( this.min +  ( range / 100 ) * parseFloat(this.subElements.thumbLeft.style.left) ) ,
      to: Math.round( this.max - ( range / 100) * parseFloat(this.subElements.thumbRight.style.right) )
    }
  }

  getSubElements (element) {
    const elements = element.querySelectorAll('[data-element]');

    return [...elements].reduce((accum, subElement) => {
      accum[subElement.dataset.element] = subElement;

      return accum;
    }, {});
  }

  remove () {
    this.element.remove();
    document.removeEventListener("pointermove", this.onThumbPointerMove);
    document.removeEventListener("pointerup", this.onThumbPointerUp);
  }

  destroy() {
    this.remove();
  }
}
