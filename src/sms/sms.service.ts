import { Injectable } from '@nestjs/common';
import { smsEndpoints } from './sms.endpoints';
import { User } from 'src/users/users.entity';
import { Customer } from 'src/customer/customer.entity';

@Injectable()
export class SmsService {
  //constructor(private readonly httpservice: HttpService) {}

  async sendForgetPassSms(user: User, token: string) {
    const fetch = (await import('node-fetch')).default;

    const userInfo = user.userfname + ' ' + user.userlname;
    let tokenBase = token;
    const token1 =
      tokenBase.length >= 25
        ? tokenBase.substring(0, 25)
        : tokenBase.substring(0);
    tokenBase = tokenBase.replace(token1, '');
    const token2 =
      tokenBase.length >= 25
        ? tokenBase.substring(0, 25)
        : tokenBase.substring(0);
    tokenBase = tokenBase.replace(token2, '');
    const token3 =
      tokenBase.length >= 25
        ? tokenBase.substring(0, 25)
        : tokenBase.substring(0);
    tokenBase = tokenBase.replace(token3, '');
    const token4 =
      tokenBase.length >= 25
        ? tokenBase.substring(0, 25)
        : tokenBase.substring(0);
    tokenBase = tokenBase.replace(token4, '');
    const token5 =
      tokenBase.length >= 25
        ? tokenBase.substring(0, 25)
        : tokenBase.substring(0);
    tokenBase = tokenBase.replace(token5, '');
    const token6 =
      tokenBase.length >= 25
        ? tokenBase.substring(0, 25)
        : tokenBase.substring(0);
    tokenBase = tokenBase.replace(token6, '');
    console.log('tokenBase', tokenBase);
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
        {
          name: 'TOKEN3',
          value: token3,
        },
        {
          name: 'TOKEN4',
          value: token4,
        },
        {
          name: 'TOKEN5',
          value: token5,
        },
        {
          name: 'TOKEN6',
          value: token6,
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

    // const response = await firstValueFrom(
    //   this.httpservice.post(smsEndpoints.verify, reqBody),
    // );
    // console.log(response?.data);
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
      tokenBase.length >= 25
        ? tokenBase.substring(0, 25)
        : tokenBase.substring(0);
    tokenBase = tokenBase.replace(token1, '');
    const token2 =
      tokenBase.length >= 25
        ? tokenBase.substring(0, 25)
        : tokenBase.substring(0);
    tokenBase = tokenBase.replace(token2, '');
    const token3 =
      tokenBase.length >= 25
        ? tokenBase.substring(0, 25)
        : tokenBase.substring(0);
    tokenBase = tokenBase.replace(token3, '');
    const token4 =
      tokenBase.length >= 25
        ? tokenBase.substring(0, 25)
        : tokenBase.substring(0);
    tokenBase = tokenBase.replace(token4, '');
    const token5 =
      tokenBase.length >= 25
        ? tokenBase.substring(0, 25)
        : tokenBase.substring(0);
    tokenBase = tokenBase.replace(token5, '');
    const token6 =
      tokenBase.length >= 25
        ? tokenBase.substring(0, 25)
        : tokenBase.substring(0);
    tokenBase = tokenBase.replace(token6, '');
    console.log('tokenBase', tokenBase);
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
          value: token2,
        },
        {
          name: 'TOKEN3',
          value: token3,
        },
        {
          name: 'TOKEN4',
          value: token4,
        },
        {
          name: 'TOKEN5',
          value: token5,
        },
        {
          name: 'TOKEN6',
          value: token6,
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
  async sendUpdateInvoiceSms(customer: Customer, token: string) {
    const fetch = (await import('node-fetch')).default;

    const userInfo =
      customer.customerGender +
      ' ' +
      customer.customerFName +
      ' ' +
      customer.customerLName;
    let tokenBase = token;
    const token1 =
      tokenBase.length >= 25
        ? tokenBase.substring(0, 25)
        : tokenBase.substring(0);
    tokenBase = tokenBase.replace(token1, '');
    const token2 =
      tokenBase.length >= 25
        ? tokenBase.substring(0, 25)
        : tokenBase.substring(0);
    tokenBase = tokenBase.replace(token2, '');
    const token3 =
      tokenBase.length >= 25
        ? tokenBase.substring(0, 25)
        : tokenBase.substring(0);
    tokenBase = tokenBase.replace(token3, '');
    const token4 =
      tokenBase.length >= 25
        ? tokenBase.substring(0, 25)
        : tokenBase.substring(0);
    tokenBase = tokenBase.replace(token4, '');
    const token5 =
      tokenBase.length >= 25
        ? tokenBase.substring(0, 25)
        : tokenBase.substring(0);
    tokenBase = tokenBase.replace(token5, '');
    const token6 =
      tokenBase.length >= 25
        ? tokenBase.substring(0, 25)
        : tokenBase.substring(0);
    tokenBase = tokenBase.replace(token6, '');
    console.log('tokenBase', tokenBase);
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
          value: token1,
        },
        {
          name: 'TOKEN2',
          value: token2,
        },
        {
          name: 'TOKEN3',
          value: token3,
        },
        {
          name: 'TOKEN4',
          value: token4,
        },
        {
          name: 'TOKEN5',
          value: token5,
        },
        {
          name: 'TOKEN6',
          value: token6,
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
    // const response = await firstValueFrom(
    //   this.httpservice.post(smsEndpoints.verify, reqBody),
    // );
    // console.log(response?.data);
  }
}
