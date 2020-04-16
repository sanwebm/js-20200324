class Tooltip {
  static instance;

  element;

  constructor() {
    if (Tooltip.instance) {
      return Tooltip.instance;
    }

    Tooltip.instance = this;
  }

  pointerOver = event => {
    const element = event.target.closest('[data-tooltip]');

    if (element){
      this.render(event.x, event.y, element.dataset.tooltip);
      document.addEventListener('pointermove', this.pointerMove);
    }
  };

  pointerOut = event => {
    if(this.element){
      this.element.remove();
      this.element = null;
      document.removeEventListener('pointermove', this.pointerMove);
    }
  };

  pointerMove = event => {
      this.element.style.left = event.x + 10 + 'px';
      this.element.style.top = event.y + 10 + 'px';
  };

  initEventListeners () {
    document.addEventListener('pointerover', this.pointerOver);
    document.addEventListener('pointerout', this.pointerOut);
  }

  initialize () {
    this.initEventListeners();
  }

  render (x=0, y=0, message='message') {
    this.element = document.createElement('div');
    this.element.classList.add('tooltip');
    this.element.style.top = `${y}px`;
    this.element.style.left = `${x}px`;
    this.element.textContent = `${message}`;
    document.body.append(this.element);
  }

  destroy () {
    if(this.element){
      this.element.remove();
      this.element = null;
      document.removeEventListener('pointermove', this.pointerMove);
    }

    document.removeEventListener('pointerover', this.pointerOver);
    document.removeEventListener('pointerout', this.pointerOut);

  }

}

const tooltip = new Tooltip();

export default tooltip;
