import { Stage, Layer, Rect, Circle, Text, Line } from "react-konva";
import { faker } from "@faker-js/faker";
import { gray } from "@radix-ui/colors";
import Konva from "konva";

const smallData: {
  name: string;
  age: string;
  email: string;
  street: string;
  phone: string;
  description: string;
  vehicle: string;
}[] = [];

for (let i = 0; i < 10000; i++) {
  smallData.push({
    name: faker.name.findName(),
    age: faker.random.numeric(),
    email: faker.internet.email(),
    street: faker.address.street(),
    phone: faker.phone.imei(),
    description: faker.lorem.lines(),
    vehicle: faker.vehicle.bicycle(),
  });
}

function Grid() {
  // return <Rect></Rect>
}

function SheetImpl(props: {
  width: number;
  height: number;
  rowHeight: number;
}) {
  const nRows = Math.ceil(props.height / props.rowHeight);

  return (
    <Stage width={props.width} height={props.height}>
      <Layer>
        {Array.from({ length: nRows }).map((_, i) => (
          <Line
            key={i}
            points={[0, i * props.rowHeight, props.width, i * props.rowHeight]}
            strokeWidth={1}
            stroke={"black"}
          />
        ))}
      </Layer>
    </Stage>
  );
}

export const Sheet = () => {
  console.log(smallData);
  return (
    <SheetImpl
      width={window.innerWidth}
      height={window.innerHeight}
      rowHeight={20}
    />
  );
};
