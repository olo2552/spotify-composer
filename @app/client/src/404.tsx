import React from "react";
import { Link } from "react-navi";
import { H2, P } from "@app/components";
import SharedLayout from "./layout/SharedLayout";
import { Row, Col } from "antd";

function FourOhFour() {
  return (
    <SharedLayout title="Page Not Found">
      <Row>
        <Col>
          <div>
            <H2>Page Not Found</H2>
            <P>
              The page you attempted to load was not found. Please check the URL
              and try again, or visit <Link href="/">the homepage</Link>
            </P>
          </div>
        </Col>
      </Row>
    </SharedLayout>
  );
}

export default FourOhFour;
