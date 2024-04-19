import { forwardRef, useContext, useRef } from "react";
import {
  createRootRoute,
  Outlet,
  Link,
  getRouterContext,
  useMatches,
  useMatch,
} from "@tanstack/react-router";
import { motion, useIsPresent, AnimatePresence } from "framer-motion";
import cloneDeep from "lodash.clonedeep";
import { routeTree } from "@/routeTree.gen";
import content from "@/assets/content.json";

export const Route = createRootRoute({
  component: Root,
});

function Root() {
  console.log("rendering root");
  const matches = useMatches();
  const match = useMatch({ strict: false });
  const nextMatchIndex = matches.findIndex((d) => d.id === match.id) + 1;
  const nextMatch = matches[nextMatchIndex];
  const routePaths = getRoutePaths();
  if (!routePaths.includes(nextMatch.id))
    return (
      <>
        <p>404</p>
        <Link to="/">Home</Link>
      </>
    );

  return (
    <main>
      <ul>
        <li>
          <Link to="/">Home</Link>
        </li>
        <li>
          <Link to="/about">About</Link>
        </li>
        <li>
          <Link to="/$cat/$det" params={{ cat: "category-1", det: "detail-1" }}>
            C1-D1
          </Link>
        </li>
        <li>
          <Link to="/$cat/$det" params={{ cat: "category-2", det: "detail-1" }}>
            C2-D1
          </Link>
        </li>
      </ul>
      <AnimatePresence mode="popLayout" initial={false}>
        <AnimatedOutlet key={nextMatch.id} />
      </AnimatePresence>
    </main>
  );
}

const AnimatedOutlet = forwardRef<HTMLDivElement>(({ ...props }, ref) => {
  const isPresent = useIsPresent();

  const matches = useMatches();
  const prevMatches = useRef(matches);

  const RouterContext = getRouterContext();
  const routerContext = useContext(RouterContext);

  let renderedContext = routerContext;

  if (isPresent) {
    prevMatches.current = cloneDeep(matches);
  } else {
    renderedContext = cloneDeep(routerContext);
    renderedContext.__store.state.matches = [
      ...matches.map((m, i) => ({
        ...(prevMatches.current[i] || m),
        id: m.id,
      })),
      ...prevMatches.current.slice(matches.length),
    ];
  }

  return (
    <motion.div
      ref={ref}
      initial={{ x: "-10%", opacity: 0 }}
      animate={{ x: "0", opacity: 1 }}
      exit={{ x: "10%", opacity: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 35 }}
      {...props}
    >
      <RouterContext.Provider value={renderedContext}>
        <Outlet />
      </RouterContext.Provider>
    </motion.div>
  );
});

function getRoutePaths() {
  const { children } = routeTree;
  const staticPaths = children
    ?.map((d) => d.fullPath)
    .filter((d) => !d.includes("$"));

  if (!staticPaths) throw new Error("No static paths found");

  const dynamicPaths = content
    .map((cat) => cat.details.map((det) => `/${cat.id}/${det.id}/`))
    .flat();

  return [...staticPaths, ...dynamicPaths];
}
