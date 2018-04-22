import { Component, Input, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'map-button',
  templateUrl: 'mapButton.html'
})

export class MapButtonComponent {

  @Input() building: any;
  @Output() showBuildingMap: EventEmitter<any> = new EventEmitter<any>();
  constructor() {}

  showMap() {
    this.showBuildingMap.emit({ building: JSON.parse(this.building) });
  }

}