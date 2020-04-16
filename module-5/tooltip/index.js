class Tooltip {
  static instance;

  element;

  constructor() {
    if (Tooltip.instance) {
      return Tooltip.instance;
    }

    Tooltip.instance = this;
  }

  pointerOver(event){
    this.render(event.x, event.y, event.target.dataset.tooltip);
  }

  pointerOut(){
    if(this.element){
      this.destroy();
    }
  }
  pointerMove(event){
    if(this.element){
      this.element.style.left = event.x + 10 + 'px';
      this.element.style.top = event.y + 10  + 'px';
    }
  }

  initEventListeners () {
    document.addEventListener('pointerover', event => {
      if(event.target.dataset.tooltip) {
        this.pointerOver(event);
      }

      document.addEventListener('pointerout', event => {
        if(event.target.dataset.tooltip){
          this.pointerOut();
        }
      });

      document.addEventListener('pointermove', event => {
        if(event.target.dataset.tooltip){
          this.pointerMove(event);
        }
      });

    });


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
    }

    document.removeEventListener('pointerover', this.pointerOver);
    document.removeEventListener('pointerout', this.pointerOut);
    document.removeEventListener('pointermove', this.pointerMove);
  }


}

const tooltip = new Tooltip();

export default tooltip;
