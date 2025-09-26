import { createRouter, createWebHistory } from 'vue-router'
import StyFinance from '@/components/STTT/StyFinance.vue'
import introPage from '@/components/STTT/IntroPage.vue'
import FundsPage from '@/components/STTT/FundsPage.vue'
import SpotlightMember from '@/components/STTT/SpotlightMember.vue'

import HomePage from '@/components/STTT/HomePage.vue'
import SignCanLen from '@/components/STTT/SignCanLen.vue'
import TeamPe from '@/components/STTT/TeamPe.vue'
import ReGister from '@/components/STTT/ReGister.vue'
import MiNing from '@/components/STTT/MiNing.vue'
import EarNing from '@/components/STTT/EarNing.vue'
import MeMber from '@/components/Text/MeMber.vue'
import DynamicDetail from '@/components/Text/DynamicDetail.vue'
import StaticDetail from '@/components/Text/StaticDetail.vue'
import CompanyProfilePage from "@/components/Text/CompanyProfilePage.vue"
import StyIntroductionPage from "@/components/Text/StyIntroductionPage.vue"
import FutureEcosystemPage from "@/components/Text/FutureEcosystemPage.vue"
import TokenConsensusPage from "@/components/Text/TokenConsensusPage.vue"
import BuyRecord from '@/components/Text/BuyRecord.vue'
import SellRecord from '@/components/Text/SellRecord.vue'
const router = createRouter({
  history: createWebHistory(),
  routes: [

    {
      path: '/',
      name: 'home',
      component: HomePage,
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
    {
      path: '/finance',
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
      path: '/spot',
      name: 'SpotlightMember',
      component: SpotlightMember
    },  {
      path: '/sign',
      name: 'SignCanLen',
      component: SignCanLen
    }, {
      path: '/register',
      name: 'ReGister',
      component: ReGister
    }, {
      path: '/teampe',
      name: 'TeamPe',
      component: TeamPe,
      meta: { hideTopBar: true }
    }, {
      path: '/mining',
      name: 'MiNing',
      component: MiNing,
      meta: { hideTopBar: true }
    }, {
      path: '/earning',
      name: 'EarNing',
      component: EarNing,
      meta: { hideTopBar: true }
    }, {
      path: '/member',
      name: 'MeMber',
      component: MeMber,
      meta: { hideTopBar: true }
    }, {
      path: '/dynamic',
      name: 'DynamicDetail',
      component: DynamicDetail,
      meta: { hideTopBar: true }
    }, {
      path: '/statuc',
      name: ' StaticDetail',
      component: StaticDetail,
      meta: { hideTopBar: true }
    },
    { 
      path: "/company-profile",
       name: 'CompanyProfilePage',
        component: CompanyProfilePage,
         meta: { hideTopBar: true }
       },
    {
       path: "/sty-introduction",
       name: 'StyIntroductionPage', 
       component: StyIntroductionPage ,
        meta: { hideTopBar: true }
      },
    {
       path: "/future-ecosystem",
       name: 'FutureEcosystemPage',
        component: FutureEcosystemPage, 
         meta: { hideTopBar: true }
      },
    {
       path: "/token-consensus",
       name: 'TokenConsensusPage',
        component: TokenConsensusPage,
         meta: { hideTopBar: true }
       },
        {
       path: "/buy",
       name: 'BuyRecord',
        component: BuyRecord,
         meta: { hideTopBar: true }
       },
        {
       path: "/cell",
       name: 'SellRecord',
        component: SellRecord,
         meta: { hideTopBar: true }
       }
  ]
})
export default router
