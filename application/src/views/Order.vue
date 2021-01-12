<template>
  <div class="about">
    <h1>Estimate shipping cost</h1>

    <form>
      <b-input v-model="address.region"></b-input>
      <b-input v-model="address.region_id"></b-input>
      <b-input v-model="address.region_code"></b-input>
      <b-input v-model="address.country_id"></b-input>
      <b-input v-model="address.street[0]"></b-input>
      <b-input v-model="address.postcode"></b-input>
      <b-input v-model="address.city"></b-input>
      <b-input v-model="address.firstname"></b-input>
      <b-input v-model="address.lastname"></b-input>
      <b-btn variant="primary" @click="getMyCart">Get shipping costs</b-btn>
    </form>
    <div v-if="data.length > 0">
        <b-card
            v-for="(item,i)  in data"
            :key="i"
            no-body
        >
          <template #header>
            <h4 class="mb-0">{{item.method_title}}</h4>
          </template>

          <b-card-body>
            <div>Price excl tax: {{item.price_excl_tax}}</div>
            <div>Price incl tax: {{item.price_incl_tax}}</div>
          </b-card-body>

          <b-card-body>
            <b-row>
              <b-col><b-btn variant="primary" @click="addToCart(product)">Select</b-btn></b-col>
            </b-row>
          </b-card-body>

        </b-card>
      </div>
    </div>
</template>
<script>
import axios from "axios";

export default {
  name: 'Order',
  props: ['apiToken','apiUrl'],
  data() {
    return {
      data: [],
      totals: [],
      dynQty: {},
      sending: false,
      response: '',
      address: {
        "region": "New York",
        "region_id": 43,
        "region_code": "NY",
        "country_id": "US",
        "street": [
          "123 Oak Ave"
        ],
        "postcode": "10577",
        "city": "Purchase",
        "firstname": "Jane",
        "lastname": "Doe",
        "customer_id": 121119694,
        "email": "jdoe@example.com",
        "telephone": "(512) 555-1111",
        "same_as_billing": 1
      }
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
    //this.getMyCart();
    //this.getMyCartTotals();
  },
  methods: {
    getMyCart() {
      this.sending = true
      let _self = this
      axios({
        method: 'POST',
        url: this.apiUrl + '/carts/mine/estimate-shipping-methods',
        data: {address: this.address},
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