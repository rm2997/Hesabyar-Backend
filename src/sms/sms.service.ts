import { BadRequestException, Injectable } from '@nestjs/common';
import { smsEndpoints } from './sms.endpoints';
import { User } from 'src/users/users.entity';
import { Customer } from 'src/customer/customer.entity';

@Injectable()
export class SmsService {
  async sendForgetPassSms(user: User, token: string) {
    const fetch = (await import('node-fetch')).default;

    const userInfo = user.userfname + ' ' + user.userlname;
    let tokenBase = token;
    const token1 =
      tokenBase.length >= 160
        ? tokenBase.substring(0, 160)
        : tokenBase.substring(0);
    tokenBase = tokenBase.replace(token1, '');
    const token2 =
      tokenBase.length >= 160
        ? tokenBase.substring(0, 160)
        : tokenBase.substring(0);
    tokenBase = tokenBase.replace(token2, '');

    const reqBody = {
      mobile: user.usermobilenumber,
      templateId: 764363,
      parameters: [
        {
          name: 'USER',
          value: userInfo,
        },
        {
          name: 'TOKEN1',
          value: token1,
        },
        {
          name: 'TOKEN2',
          value: token2,
        },
      ],
    };

    const res = await fetch(smsEndpoints.verify, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-KEY': '7uyRcCHDKpobMJz0B0G3kOX4fO4gyTuwrrsSuWrgIrr50qvy',
      },
      body: JSON.stringify(reqBody),
    });
    return await res.json();
  }
  async sendUpdateProformaSms(customer: Customer, token: string) {
    const fetch = (await import('node-fetch')).default;

    const userInfo =
      customer.customerGender +
      ' ' +
      customer.customerFName +
      ' ' +
      customer.customerLName;
    let tokenBase = token;
    const token1 =
      tokenBase.length >= 160
        ? tokenBase.substring(0, 160)
        : tokenBase.substring(0);

    console.log('token1:', token1);
    console.log('token1,tokenBase', tokenBase == token1);
    if (token1 != tokenBase) tokenBase = tokenBase.replace(token1, '');
    else tokenBase = '';
    console.log('tokenBase:', tokenBase);
    const reqBody = {
      mobile: customer.customerMobile,
      templateId: 763246,
      parameters: [
        {
          name: 'CUSTOMER',
          value: userInfo,
        },
        {
          name: 'TOKEN1',
          value: token1,
        },
        {
          name: 'TOKEN2',
          value: tokenBase,
        },
      ],
    };
    const res = await fetch(smsEndpoints.verify, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-KEY': '7uyRcCHDKpobMJz0B0G3kOX4fO4gyTuwrrsSuWrgIrr50qvy',
      },
      body: JSON.stringify(reqBody),
    });
    console.log(reqBody);

    const result = await res.json();
    console.log(result);

    return result;
  }
  async sendUpdateInvoiceSms(customer: Customer, token: string) {
    try {
      const fetch = (await import('node-fetch')).default;

      const userInfo =
        customer.customerGender +
        ' ' +
        customer.customerFName +
        ' ' +
        customer.customerLName;

      const reqBody = {
        mobile: customer.customerMobile,
        templateId: 174810,
        parameters: [
          {
            name: 'CUSTOMER',
            value: userInfo,
          },
          {
            name: 'TOKEN1',
            value: token,
          },
        ],
      };
      console.log(reqBody);

      const res = await fetch(smsEndpoints.verify, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-KEY': '7uyRcCHDKpobMJz0B0G3kOX4fO4gyTuwrrsSuWrgIrr50qvy',
        },
        body: JSON.stringify(reqBody),
      });
      const result = await res.json();
      console.log(result);

      return result;
    } catch (error) {
      console.log(error);

      throw new BadRequestException('ارسال پیامک شکست خورد');
    }
  }
  async sendUpdateInvoiceDriverNameSms(
    customer: Customer,
    token: string,
    invoiceId: number,
  ) {
    try {
      const fetch = (await import('node-fetch')).default;

      const userInfo =
        customer.customerGender +
        ' ' +
        customer.customerFName +
        ' ' +
        customer.customerLName;

      const reqBody = {
        mobile: customer.customerMobile,
        templateId: 714566,
        parameters: [
          {
            name: 'CUSTOMER',
            value: userInfo,
          },
          {
            name: 'TOKEN',
            value: token,
          },
          {
            name: 'INVOICEID',
            value: invoiceId,
          },
        ],
      };
      console.log(reqBody);

      const res = await fetch(smsEndpoints.verify, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-KEY': '7uyRcCHDKpobMJz0B0G3kOX4fO4gyTuwrrsSuWrgIrr50qvy',
        },
        body: JSON.stringify(reqBody),
      });
      const result = await res.json();
      console.log(result);

      return result;
    } catch (error) {
      console.log(error);
      throw new BadRequestException('ارسال پیامک شکست خورد');
    }
  }

  async sendUpdateDepotSms(
    customer: Customer,
    token: string,
    invoiceId: number,
  ) {
    try {
      const fetch = (await import('node-fetch')).default;

      const userInfo =
        customer.customerGender +
        ' ' +
        customer.customerFName +
        ' ' +
        customer.customerLName;

      const reqBody = {
        mobile: customer.customerMobile,
        templateId: 714566,
        parameters: [
          {
            name: 'CUSTOMER',
            value: userInfo,
          },
          {
            name: 'TOKEN',
            value: token,
          },
          {
            name: 'INVOICEID',
            value: invoiceId,
          },
        ],
      };
      console.log(reqBody);

      const res = await fetch(smsEndpoints.verify, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-KEY': '7uyRcCHDKpobMJz0B0G3kOX4fO4gyTuwrrsSuWrgIrr50qvy',
        },
        body: JSON.stringify(reqBody),
      });
      const result = await res.json();
      console.log(result);

      return result;
    } catch (error) {
      console.log(error);
      throw new BadRequestException('ارسال پیامک شکست خورد');
    }
  }

  async sendValidationKeySms(mobileNumber: string, key: string) {
    const fetch = (await import('node-fetch')).default;

    const reqBody = {
      mobile: mobileNumber,
      templateId: 580229,
      parameters: [
        {
          name: 'CODE',
          value: key,
        },
      ],
    };

    const res = await fetch(smsEndpoints.verify, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-KEY': '7uyRcCHDKpobMJz0B0G3kOX4fO4gyTuwrrsSuWrgIrr50qvy',
      },
      body: JSON.stringify(reqBody),
    });
    return await res.json();
  }
  async sendDepotExitSms(
    mobileNumber: string,
    invoiceNumber: number,
    driverInfo: string,
    token: string,
  ) {
    const fetch = (await import('node-fetch')).default;

    const reqBody = {
      mobile: mobileNumber,
      templateId: 251064,
      parameters: [
        {
          name: 'INVOICENO',
          value: invoiceNumber,
        },
        {
          name: 'DRIVER',
          value: driverInfo,
        },
        {
          name: 'TOKEN',
          value: token,
        },
      ],
    };
    const res = await fetch(smsEndpoints.verify, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-KEY': '7uyRcCHDKpobMJz0B0G3kOX4fO4gyTuwrrsSuWrgIrr50qvy',
      },
      body: JSON.stringify(reqBody),
    });
    const result = await res.json();
    console.log(result);

    return result;
  }
}
