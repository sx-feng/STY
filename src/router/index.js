import { createRouter, createWebHistory } from 'vue-router'
import StyFinance from '@/components/STTT/StyFinance.vue'
import introPage from '@/components/STTT/IntroPage.vue'
import FundsPage from '@/components/STTT/FundsPage.vue'
import SpotlightMember from '@/components/STTT/SpotlightMember.vue'
import TopBar from '@/components/STTT/TopBar.vue'
import HomePage from '@/components/STTT/HomePage.vue'
import SignCanLen from '@/components/STTT/SignCanLen.vue'
import ChangePass from '@/components/STTT/ChangePass.vue'
const router = createRouter({
  history: createWebHistory(),
  routes: [
    {  
      path: '/',
       name: 'home',
        component:HomePage,
      },
      /**
       * 比如这个页面不要top
       *     {  
      path: '/',
       name: 'home',
        component:HomePage,
        meta: { hideTopBar: true }
      },
       */
     { path: '/finance',
      name: 'StyFinance', 
       component: StyFinance
       },
     {
        path: '/info',
        name: 'introPage',
        component: introPage
      },
      {
        path: '/funds',
        name: 'FundsPage',
        component: FundsPage
      },
    {
      path:'/spot',
      name:'SpotlightMember',
      component:SpotlightMember
    },{
      path:'/top',
      name:'TopBar',
      component:TopBar
    },{
      path:'/sign',
      name:'SignCanLen',
      component:SignCanLen
    },{
      path:'/change',
      name:'ChangePass',
      component:ChangePass
    }]
})
export default router
