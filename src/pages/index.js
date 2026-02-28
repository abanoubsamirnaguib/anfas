import { heartOutline, homeOutline } from "ionicons/icons";

import Categories from "./Categories";
import Favourites from "./Favourites";
import Category from "./Category";
import Product from "./Product";

export const pages = [

  {
    href: "/",
    icon: homeOutline,
    component: Categories,
    default: true,
    isTab: true
  },
  {
    href: "/categories/:category",
    icon: homeOutline,
    component: Category,
    default: true,
    isTab: false
  },
  {
    href: "/categories/:category/products/:slug",
    icon: homeOutline,
    component: Product,
    default: false,
    isTab: false
  },
  {
    href: "/favourites",
    icon: heartOutline,
    component: Favourites,
    default: false,
    isTab: true
  }
];