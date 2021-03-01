import React, { ReactNode } from "react";

import LayoutDefault from "components/LayoutDefault";

import styles from "./LayoutUser.module.scss";

interface IProps {
    children: ReactNode
}

const LayoutUser: React.FC<IProps> = (props: IProps) => {
  return (
    <LayoutDefault>
      <div className={styles["layout-user"]}>
        <div className={styles["layout-user__main"]}>
          <div className={styles["layout-user__content"]}>{props.children}</div>
        </div>
      </div>
    </LayoutDefault>
  );
};

export default LayoutUser;
