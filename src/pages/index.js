import { heartOutline, homeOutline } from "ionicons/icons";

import Categories from "./Categories";
import Favourites from "./Favourites";
import Category from "./Category";

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
    href: "/favourites",
    icon: heartOutline,
    component: Favourites,
    default: false,
    isTab: true
  }
];