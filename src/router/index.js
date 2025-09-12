import { createRouter, createWebHistory } from 'vue-router'
import StyFinance from '@/components/STTT/StyFinance.vue'
import introPage from '@/components/STTT/IntroPage.vue'
import FundsPage from '@/components/STTT/FundsPage.vue'
import SpotlightMember from '@/components/STTT/SpotlightMember.vue'
import AppSidenav from '@/components/STTT/AppSidenav.vue'
const router = createRouter({
  history: createWebHistory(),
  routes: [{ path: '/', redirect: '/finance' },
     { path: '/finance', component: StyFinance },
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
      path:'/app',
      name:'AppSidenav',
      component:AppSidenav
    }]
})
export default router
