import { LightningElement, api, track } from 'lwc';

export default class LwcForm extends LightningElement {
      handleAccountSelect(event){
        // Access the recordId which will contain either a single ID or comma-separated IDs
        let recordId = event.detail.recordId;
        console.log('Selected account id(s):', recordId);
    }   
}
