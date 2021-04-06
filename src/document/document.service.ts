import { Injectable } from '@nestjs/common';
import puppeteer, { PDFOptions } from 'puppeteer';
import handlebars from 'handlebars';
import path from 'path';
import fs from 'fs';

import { WaybillModel } from 'src/common/interfaces';

import mapTransactions from './helpers/mapTransactions';

const templateHTML = fs.readFileSync(
  path.join(__dirname, 'templates', 'invoice.html'),
  'utf-8',
);

@Injectable()
export class DocumentService {
  async makeInvoice(waybill: WaybillModel) {
    const zeroPad = (num: number, places: number) =>
      String(num).padStart(places, '0');
    handlebars.registerHelper('incremented', (index) => {
      return index + 1;
    });
    handlebars.registerHelper('toFixed', function (distance) {
      return distance.toFixed(2);
    });
    const template = handlebars.compile(templateHTML);
    const html = template({
      invoiceDate: waybill.createdAt.toLocaleDateString('ru-RU'),
      serialNumber: zeroPad(waybill.serialNumber, 6),
      source: (waybill.source as any)?.title,
      destination: (waybill.destination as any)?.title,
      items: mapTransactions(waybill).map(({ product, price, quantity }) => ({
        product,
        price,
        quantity,
        total: quantity * price,
      })),
      subtotal: waybill.transactions.reduce(
        (acc, { quantity, price }) => (acc += quantity * price),
        0,
      ),
    });

    const options = {
      width: '1000px',
      format: 'A5',
      headerTemplate: '<p></p>',
      footerTemplate: '<p></p>',
      displayHeaderFooter: false,
      margin: {
        top: '10px',
        bottom: '30px',
        left: '150px',
      },
      printBackground: true,
    };

    const browserOptions = {
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
      ],
      headless: true,
    };
    if (process.env.NODE_ENV === 'production') {
      browserOptions['executablePath'] = '/usr/bin/google-chrome-stable';
    }
    const browser = await puppeteer.launch(browserOptions);
    const page = await browser.newPage();
    await page.setContent(html);
    const pdfFile = await page.pdf(options as PDFOptions);
    await browser.close();
    return pdfFile;
  }
}
