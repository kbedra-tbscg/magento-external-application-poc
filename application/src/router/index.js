import Vue from 'vue'
import VueRouter from 'vue-router'
import Home from '../views/Home.vue'
import Account from '../views/Account.vue'
import Cart from '../views/Cart.vue'
import Order from '../views/Order.vue'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/account',
    name: 'My Account',
    component: Account
  },
  {
    path: '/cart',
    name: 'My shopping cart',
    component: Cart
  },
  {
    path: '/order',
    name: 'Order',
    component: Order
  }
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

export default router
