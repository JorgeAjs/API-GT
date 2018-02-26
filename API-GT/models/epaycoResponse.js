'use strict'

const mongoose = require('mongoose')
const Schema = mongoose.Schema

const EpaycoResponseSchema = Schema({
    x_cust_id_cliente:String,
    x_description:String,
    x_amount_ok:String,
    x_id_invoice:String,
    x_amount_base:String,
    x_tax:String,
    x_currency_code:String,
    x_franchise:String,
    x_transaction_date:String,
    x_approval_code:String,
    x_transaction_id:String,
    x_ref_payco:String,
    x_cod_response:String,
    x_signature:String,
    x_response:String,
    x_response_reason_text:String,
    x_extra1:String,
    x_extra2:String,
    x_extra3:String,
    x_customer_doctype:String,
    x_customer_document:String,
    x_customer_name:String,
    x_customer_lastname:String,
    x_customer_email:String,
    x_customer_phone:String,
    x_customer_country:String,
    x_customer_city:String,
    x_customer_address:String,
    x_customer_ip:String    
})

var EpaycoResponse = mongoose.model('EpaycoResponse', EpaycoResponseSchema)
module.exports = EpaycoResponse