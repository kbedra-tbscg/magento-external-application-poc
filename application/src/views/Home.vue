<template>
  <div class="home p-4 text-left">

    <div v-if="confirmation">
      {{confirmation}}
    </div>

    <b-row>
      <b-col>
        <b-input v-model="searchTerm" />
      </b-col>
      <b-col>
        <b-btn variant="primary" @click="getProducts">Search</b-btn>
      </b-col>
    </b-row>
    <div>Items: {{products.total_count}}</div>

    <b-card-group columns v-if="products.items">
      <b-card
        v-for="product in products.items"
        :key="product.id"
        no-body
        :img-src="'https://mcstaging.bobcatparts.com/media/catalog/product/cache/ba54b82003ac7796a8e809a9bbb1bac1' + getFile(product)"
        img-alt="Image"
        img-top
    >
      <template #header>
        <h4 class="mb-0">{{product.name}}</h4>
      </template>

      <b-card-body>
        <template v-for="(attr,index) in product.custom_attributes">
          <b-card-text :key="index" v-if="attr.attribute_code === 'description'" v-html="attr.value">
          </b-card-text>
        </template>
      </b-card-body>

      <b-list-group flush>
        <b-list-group-item>Price: <strong>{{product.price}}$</strong></b-list-group-item>
        <b-list-group-item>SKU: {{product.sku}}</b-list-group-item>
      </b-list-group>

      <b-card-body>
        <b-row>
          <b-col><b-input v-model="dynQty[product.id]"></b-input></b-col>
          <b-col><b-btn variant="primary" @click="addToCart(product)">Add to cart</b-btn></b-col>
        </b-row>
      </b-card-body>

    </b-card>
    </b-card-group>

    <div class="overflow-auto">
      <b-pagination
          v-model="currentPage"
          :total-rows="products.total_count"
          :per-page="10"
          @change="changePage"

      ></b-pagination>

      <p class="mt-3">Current Page: {{ currentPage }}</p>

    </div>

    <div v-if="response!==''">Response: {{response}}</div>
  </div>
</template>

<script>
import axios from "axios";

export default {
  name: 'Home',
  props: ['apiToken','apiUrl'],
  data() {
    return {
      confirmation: null,
      dynQty: {},
      searchTerm:'',
      products: [],
      currentPage: 1,
      sending: false,
      response: '',
      request: { query: {
        'searchCriteria[pageSize]':10,
      } },
    }
  },
  watch: {
    searchTerm(n) {
       if (n!=='') {
         this.request.query['searchCriteria[filterGroups][0][filters][0][value]']='%' + n + '%';
         this.request.query['searchCriteria[filterGroups][0][filters][0][conditionType]']='like';
         this.request.query['searchCriteria[filterGroups][0][filters][0][field]']='name';
       } else {
         this.request.query['searchCriteria[filterGroups][0][filters][0][value]']='';
         this.request.query['searchCriteria[filterGroups][0][filters][0][field]']='';
       }
    },
    products(n) {
      for (const prod in n.items) {
        this.dynQty[n.items[prod].id] = 1;
      }
    }
  },
  computed: {

  },
  mounted() {
    this.getProducts()
  },
  methods: {
    getFile(p) {
      console.log(p)
      if (p.media_gallery_entries && p.media_gallery_entries.length > 0) {
        return p.media_gallery_entries[0].file
      } else {
        return ''
      }
    },
    changePage() {
      this.request.query["searchCriteria[currentPage]"] = this.currentPage
      this.getProducts()
    },
    getProducts() {
      this.sending = true
      let _self = this
      axios({
        method: 'GET',
        url: this.apiUrl + '/products',
        headers: {
          'Authorization': `Bearer ${this.apiToken}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        params: this.request.query,
      }).then(function (response) {
        _self.products = response.data;
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
    addToCart(item) {
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
            "sku": item.sku,
            "qty": _self.dynQty[item.id],
            "quote_id": "%%quote%%"
          }
        },
      }).then(function (response) {
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
    }
  }
}
</script>
<style>
.card img {
  width: 40%;
}
.card {
  text-align: center;
}
</style>