import { Suspense } from "react";
import { proxy, useSnapshot } from "valtio";

const ff = async () =>
  new Promise<{ value: number }>((resolve) => {
    setTimeout(() => resolve({ value: 1 }), 1000);
  });

const stateA = proxy({
  x: 0,
  loading: false,
  actions: {
    add() {
      ++stateA.x;
    },
    async getAsync() {
      stateA.loading = true;
      const value = await new Promise<number>((resolve) =>
        setTimeout(() => resolve(Math.floor(Math.random() * 1000)), 1000)
      );
      stateA.x = value;
      stateA.loading = false;
      return value;
    }
  }
});
const stateB = proxy({ y: 0 });
const stateAB = proxy({ stateA, stateB });
const state = proxy({ delayedCount: ff(), count: 0 });

const Component = () => {
  const snap = useSnapshot(state);
  const snapStateAB = useSnapshot(stateAB);

  return (
    <div className="App">
      {"delayed:"}
      {snap.delayedCount.value}
      {" count:"}
      {snap.count}
      {" stateA x:"}
      {snapStateAB.stateA.x}
      {" stateB y:"}
      {snapStateAB.stateB.y}
      <button onClick={() => ++state.count}>+</button>
      <button onClick={() => --state.count}>-</button>
      <button onClick={stateA.actions.add}>+x</button>
      <button disabled={true} onClick={() => ++stateAB.stateA.x}>
        +x2
      </button>

      <button
        disabled={snapStateAB.stateA.loading}
        onClick={snapStateAB.stateA.actions.getAsync}
      >
        AsyncGet
      </button>
    </div>
  );
};

export default function App() {
  return (
    <Suspense fallback={<>Waiting...</>}>
      <Component />
    </Suspense>
  );
}
