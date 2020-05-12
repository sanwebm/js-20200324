export default class SortableList {
  element;

  onPointerDown(event){
    if (event.which !== 1) return;

    const target = event.target;

    const itemElement = target.closest('.sortable-list__item');

    if(itemElement){
      if(target.closest('[data-grab-handle]')){
        event.preventDefault();
        this.prepareDragging(itemElement, event);
      }
    }
    if (event.target.closest('[data-delete-handle]')) {
      event.preventDefault();
      itemElement.remove();
    }

  }

  onDocumentPointerMove = ({clientX, clientY}) =>{
    this.dragTo(clientX, clientY);

    this.copyElement.style.display = 'none';
    let elemBelow = document.elementFromPoint(clientX, clientY);
    this.copyElement.style.display = 'list-item';
    this.copyElement.style.display = ''; // to match css in this project

    this.scrollIfCloseToWindowEdge(clientY);

    if (!elemBelow) return;
    if (!elemBelow.classList.contains('sortable-list__item')) return;

    const elemBelowY = elemBelow.getBoundingClientRect().top + pageYOffset;
    const elemBelowHalfHeight = elemBelow.offsetHeight / 2;

    if(clientY + pageYOffset < (elemBelowY + elemBelowHalfHeight) ) {
      elemBelow.before(this.placeholderElement);
    }
    else{
      elemBelow.after(this.placeholderElement);
    }

  };

  onDocumentPointerUp = () => {
    this.stopDragging();
  };

  constructor({ items = [] } = {}) {
    this.items = items;

    this.render();
  }

  render() {
    this.element = document.createElement('ul');
    this.element.className = 'sortable-list';

    [...this.items].map( item => {
      item.classList.add('sortable-list__item');
    });

    this.element.append(...this.items);

    this.initEventListeners();
  }

  initEventListeners () {
    this.element.addEventListener('pointerdown', event => this.onPointerDown(event));
  }

  prepareDragging(itemElement, {clientX, clientY}){
    this.shift = {
      x: clientX - itemElement.getBoundingClientRect().x,
      y: clientY - itemElement.getBoundingClientRect().y
    };

    this.copyElement = itemElement.cloneNode(true);
    itemElement.after(this.copyElement);

    this.copyElement.classList.add('sortable-list__item_dragging');

    this.copyElement.style.width = itemElement.offsetWidth + 'px';
    this.copyElement.style.height = itemElement.offsetHeight + 'px';

    this.placeholderElement = document.createElement('li');
    this.placeholderElement.className = 'sortable-list__placeholder';

    this.placeholderElement.style.width = this.copyElement.style.width;
    this.placeholderElement.style.height = this.copyElement.style.height;

    itemElement.after(this.placeholderElement);
    itemElement.remove();

    this.dragTo(clientX, clientY);

    document.addEventListener('pointermove', this.onDocumentPointerMove);
    document.addEventListener('pointerup',  this.onDocumentPointerUp);

  }

  stopDragging(){

    this.placeholderElement.replaceWith(this.copyElement);
    this.copyElement.classList.remove('sortable-list__item_dragging');

    this.copyElement.style.left = '';
    this.copyElement.style.top = '';
    this.copyElement.style.width = '';
    this.copyElement.style.height = '';

    document.removeEventListener('pointermove', this.onDocumentPointerMove);
    document.removeEventListener('pointerup',  this.onDocumentPointerUp);
  }

  dragTo(clientX, clientY) {
    this.copyElement.style.left = clientX - this.shift.x + 'px';
    this.copyElement.style.top = clientY - this.shift.y + 'px';
  }

  scrollIfCloseToWindowEdge(clientY) {
    const scrollingValue = 10;
    const threshold = 20;

    if (clientY  < threshold) {
      window.scrollBy(0, -scrollingValue);
    } else if (clientY > document.documentElement.clientHeight - threshold) {
      window.scrollBy(0, scrollingValue);
    }
  }

}
