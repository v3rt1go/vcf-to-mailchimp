'use strict';

import vdata from "vdata-parser";
import validator from "validator";
import {MailChimpAPI} from "mailchimp";
import _ from 'lodash';

const mailchimpApiKey = process.env.MAILCHIMP_API_KEY; 

let mailchimpApi;
try {
  mailchimpApi = new MailChimpAPI(mailchimpApiKey, {version: '2.0'});
} catch (e) {
  console.error(e);
}


vdata.fromFile(__dirname + "/contacts.vcf", (err, res) => {
  if (err) throw err;

  const contacts = _.map(res.VCARD, createMailchimpContact);
  mailchimpApi.call('lists', 'list', {start: 0, limit: 25}, (err, lists) => {
    if (err) throw err;

    const firstListId = _.result(_.findWhere(lists.data, {'name': 'First list'}), 'id');
    importContacts(firstListId, contacts, (err, result) => {
      if (err) throw err;

      console.log(result);
    });
  });
});

const createMailchimpContact = (vdataContact) => {
  if (validator.isEmail(vdataContact.EMAIL.value)) {
    return {
      email: {
        email: vdataContact.EMAIL.value 
      },
      email_type: 'html',
      merge_vars: {
        EMAIL: vdataContact.EMAIL.value,
        FNAME: vdataContact.FN
      }
    };
  }
};

const importContacts = (id, contacts, next) => {
  mailchimpApi.call('lists', 'batch-subscribe', {
      id: id, 
      batch: contacts, 
      double_optin: false, 
      update_existing: true, 
      replace_interests: false
    }, (err, res) => {
      if (err) next(err);
      next(null, res);
  });
};
