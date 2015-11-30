'use strict';

import vdata from "vdata-parser";
import validator from "validator";
import {MailChimpAPI} from "mailchimp";
import _ from 'lodash';

const mailchimpApiKey = process.env.MAILCHIMP_API_KEY; 
const testContact = {
  email: {
    email: 'agriciuc@gmail.com' 
  }, 
  email_type: 'html', 
  merge_vars: { 
    EMAIL: 'agriciuc@gmail.com', 
    FNAME: 'Alex',
    LNAME: 'GRICIUC'
  }
};

let mailchimpApi;
try {
  mailchimpApi = new MailChimpAPI(mailchimpApiKey, {version: '2.0'});
} catch (e) {
  console.error(e);
}


vdata.fromFile(__dirname + "/contacts-test.vcf", (err, res) => {
  if (err) throw err;

  mailchimpApi.call('lists', 'list', {start: 0, limit: 25}, (err, lists) => {
    if (err) throw err;

    const firstListId = _.result(_.findWhere(lists.data, {'name': 'First list'}), 'id');
    console.log(firstListId);
  });
});

const importContacts = (id, contacts, next) => {
  mailchimpApi.call('lists', 'batch-subscribe', {
      id: id, 
      batch: contacts, 
      double_optin: false, 
      update_existing: false, 
      replace_interests: false
    }, (err, res) => {
      if (err) next(err);
      next(null, res);
  });
};