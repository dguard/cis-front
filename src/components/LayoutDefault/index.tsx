import React, {ReactNode} from "react";
import { observer } from "mobx-react";
import { Link, useHistory } from "react-router-dom";

import styles from "./LayoutDefault.module.scss";

const PRIVATE_ROUTES = ["/user"];

interface IProps {
    children: ReactNode
}

const LayoutDefault: React.FC = observer((props: IProps) => {

  return (
    <div className={styles["layout-default"]}>
      <div className={styles["layout-default__links-content"]}>
        <div className={styles["layout-default__links"]}>
          <Link
            to="/"
            style={{
              color: "#2980b9",
              textDecoration: "initial",
              fontSize: 23,
            }}
          >
            Home
          </Link>
          <Link
            to="/signin"
            style={{
                color: "#2980b9",
                textDecoration: "initial",
                fontSize: 23
            }}
          >
            Sign In
          </Link>
        </div>
      </div>
      <div className={styles["layout-default__content"]}>{props.children}</div>
    </div>
  );
});

export default LayoutDefault;
