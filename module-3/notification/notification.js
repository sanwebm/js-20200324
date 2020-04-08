export default class NotificationMessage {

  element;

  constructor(text = '',
              {
                duration = 2000,
                type = 'success'
              } = {}) {
    this.text = text;
    this.duration = duration;
    this.type = type;

    this.render();
  }

  get template () {
    return `
  <div class="notification ${this.type}" style="--value:${this.duration / 1000}s">
    <div class="timer"></div>
    <div class="inner-wrapper">
      <div class="notification-header">${this.type}</div>
      <div class="notification-body">
        ${this.text}
      </div>
    </div>
  </div>
    `;
  }

  render() {
    const element = document.createElement('div');

    element.innerHTML = this.template;
    this.element = element.firstElementChild;

  }

  show(targetElement = document.body) {

    targetElement.append(this.element);

    setTimeout(() => {
      this.remove();
    }, this.duration)
  }

  remove() {
    if (this.element){
      this.element.remove();
    }
  }

  destroy() {
    this.remove();
  }

}
