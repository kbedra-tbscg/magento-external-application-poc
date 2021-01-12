<template>
  <div class="about">
    <h1>My cart page</h1>

    <div v-if="data">
      <div>Items count: {{data.items_count}}</div>
      <div>Items quantity: {{data.items_qty}}</div>
      <div v-for="(item,index) in data.items" :key="index">
        <b-row class="mb-2">
          <b-col>
            {{item.name}}
          </b-col>
          <b-col>
            {{item.price}} USD
          </b-col>
          <b-col>
            <b-form-input v-if="typeof dynQty[item.item_id] !== 'undefined'" v-model="dynQty[item.item_id]" />
          </b-col>
          <b-col>
            <b-btn variant="primary" @click="updateItem(item)">update quantity</b-btn>
          </b-col>
          <b-col>
            <b-btn variant="primary" @click="removeItem(item)">Remove items</b-btn>
          </b-col>
        </b-row>
      </div>
    </div>


    <div v-if="totals">
      <h5>Totals:</h5>
      <div>Shipping: {{totals.base_shipping?totals.base_shipping:'0'}} {{totals.base_currency_code}}</div>
      <div>Subtotal: {{totals.base_subtotal}} {{totals.base_currency_code}}</div>
      <div>Discount: {{totals.discount_amount}} {{totals.base_currency_code}}</div>
      <div>Grand total: {{totals.grand_total}} {{totals.base_currency_code}}</div>
      <b-btn variant="primary" @click="$router.replace('/order')">Checkout</b-btn>
    </div>
  </div>
</template>
<script>
import axios from "axios";

export default {
  name: 'Cart',
  props: ['apiToken','apiUrl'],
  data() {
    return {
      data: [],
      totals: [],
      dynQty: {},
      sending: false,
      response: '',
    }
  },
  watch: {
    data(n) {
      for(const item in n.items) {
        this.dynQty[n.items[item].item_id] = n.items[item].qty
      }
    }
  },
  computed: {

  },
  mounted() {
    this.getMyCart();
    this.getMyCartTotals();
  },
  methods: {
    getMyCart() {
      this.sending = true
      let _self = this
      axios({
        method: 'GET',
        url: this.apiUrl + '/carts/mine',
        headers: {
          'Authorization': `Bearer ${this.apiToken}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
      }).then(function (response) {
        _self.data = response.data;
        _self.sending = false
      }).catch(function (error) {
        _self.sending = false
        if (error.response && error.response.data) {
          _self.response = error.response.data;
        } else if (error.response) {
          _self.response = error.response
        } else {
          _self.response = error
        }
      });
    },
    removeItem(item) {
      this.sending = true
      let _self = this
      axios({
        method: 'DELETE',
        url: this.apiUrl + '/carts/mine/items/' + item.item_id,
        headers: {
          'Authorization': `Bearer ${this.apiToken}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
      }).then(function (response) {
        console.log('removal ok')
        _self.getMyCart();
        _self.getMyCartTotals();
        _self.confirmation = response.data;
        _self.sending = false
      }).catch(function (error) {
        _self.sending = false
        if (error.response && error.response.data) {
          _self.response = error.response.data;
        } else if (error.response) {
          _self.response = error.response
        } else {
          _self.response = error
        }
      });
    },
    updateItem(item) {
      this.sending = true
      let _self = this
      axios({
        method: 'POST',
        url: this.apiUrl + '/carts/mine/items',
        headers: {
          'Authorization': `Bearer ${this.apiToken}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        data: {
          "cartItem": {
            "item_id": item.item_id,
            "qty": parseInt(_self.dynQty[item.item_id]),
            "quote_id": "%%quote%%"
          }
        },
      }).then(function (response) {
        _self.getMyCart();
        _self.getMyCartTotals();
        _self.confirmation = response.data;
        _self.sending = false
      }).catch(function (error) {
        _self.sending = false
        if (error.response && error.response.data) {
          _self.response = error.response.data;
        } else if (error.response) {
          _self.response = error.response
        } else {
          _self.response = error
        }
      });

    },
    getMyCartTotals() {
      this.sending = true
      let _self = this
      axios({
        method: 'GET',
        url: this.apiUrl + '/carts/mine/totals',
        headers: {
          'Authorization': `Bearer ${this.apiToken}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
      }).then(function (response) {
        _self.totals = response.data;
        _self.sending = false
      }).catch(function (error) {
        _self.sending = false
        if (error.response && error.response.data) {
          _self.response = error.response.data;
        } else if (error.response) {
          _self.response = error.response
        } else {
          _self.response = error
        }
      });
    }
  }
}
</script>