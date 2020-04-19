import React, {
  useRef,
  useEffect,
  FormEvent,
  useMemo,
  useCallback,
  useState,
} from "react";
import SharedLayout, {
  Row,
  Col,
  SharedLayoutChildProps,
} from "../layout/SharedLayout";
import { Link, useNavigation } from "react-navi";
import { Form, Icon, Input, Button, Alert, Typography } from "antd";
import { FormComponentProps, ValidateFieldsOptions } from "antd/lib/form/Form";
import { promisify } from "util";
import { useApolloClient } from "@apollo/react-hooks";
import { useLoginMutation } from "@app/graphql";
import { ApolloError } from "apollo-client";
import { getCodeFromError, extractError } from "../errors";
import { Redirect, SocialLoginOptions } from "@app/components";
import { resetWebsocketConnection } from "../helpers/apolloClient";

const { Paragraph } = Typography;

function hasErrors(fieldsError: Record<string, string[] | undefined>) {
  return Object.keys(fieldsError).some(field => fieldsError[field]);
}

interface LoginProps {
  next: string | null;
}

function isSafe(nextUrl: string | null) {
  return (nextUrl && nextUrl[0] === "/") || false;
}

/**
 * Login page just renders the standard layout and embeds the login form
 */
export const Login: React.FC<LoginProps> = ({ next: rawNext }) => {
  const [error, setError] = useState<Error | ApolloError | null>(null);
  const [showLogin, setShowLogin] = useState<boolean>(false);
  const next: string = isSafe(rawNext) ? rawNext! : "/";
  return (
    <SharedLayout title="Sign in">
      {({ currentUser }: SharedLayoutChildProps) =>
        currentUser ? (
          <Redirect href={next} />
        ) : (
          <Row type="flex" justify="center" style={{ marginTop: 32 }}>
            {showLogin ? (
              <Col xs={24} sm={12}>
                <Row>
                  <WrappedLoginForm
                    onSuccessRedirectTo={next}
                    onCancel={() => setShowLogin(false)}
                    error={error}
                    setError={setError}
                  />
                </Row>
              </Col>
            ) : (
              <Col xs={24} sm={12}>
                <Row style={{ marginBottom: 8 }}>
                  <Col span={28}>
                    <Button
                      data-cy="loginpage-button-withusername"
                      icon="mail"
                      size="large"
                      block
                      onClick={() => setShowLogin(true)}
                    >
                      Sign in with E-mail or Username
                    </Button>
                  </Col>
                </Row>
                <Row style={{ marginBottom: 8 }}>
                  <Col span={28}>
                    <SocialLoginOptions next={next} />
                  </Col>
                </Row>
                <Row type="flex" justify="center">
                  <Col>
                    <Paragraph>
                      No Account?{" "}
                      <Link
                        href="/register"
                        data-cy="loginpage-button-register"
                      >
                        Create One
                      </Link>
                    </Paragraph>
                  </Col>
                </Row>
              </Col>
            )}
          </Row>
        )
      }
    </SharedLayout>
  );
};

interface FormValues {
  username: string;
  password: string;
}

interface LoginFormProps extends FormComponentProps<FormValues> {
  onSuccessRedirectTo: string;
  error: Error | ApolloError | null;
  setError: (error: Error | ApolloError | null) => void;
  onCancel: () => void;
}

function LoginForm({
  form,
  onSuccessRedirectTo,
  onCancel,
  error,
  setError,
}: LoginFormProps) {
  const [login] = useLoginMutation({});
  const client = useApolloClient();
  const navigation = useNavigation();
  const validateFields: (
    fieldNames?: Array<string>,
    options?: ValidateFieldsOptions
  ) => Promise<FormValues> = useMemo(
    () => promisify((...args) => form.validateFields(...args)),
    [form]
  );

  const handleSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      setError(null);
      try {
        const values = await validateFields();
        await login({
          variables: {
            username: values.username,
            password: values.password,
          },
        });
        // Success: refetch
        resetWebsocketConnection();
        client.resetStore();
        navigation.navigate(onSuccessRedirectTo);
      } catch (e) {
        const code = getCodeFromError(e);
        if (code === "CREDS") {
          form.setFields({
            password: {
              value: form.getFieldValue("password"),
              errors: [new Error("Incorrect username or password")],
            },
          });
        } else {
          setError(e);
        }
      }
    },
    [
      client,
      form,
      login,
      onSuccessRedirectTo,
      setError,
      validateFields,
      navigation,
    ]
  );

  const focusElement = useRef<Input>(null);
  useEffect(
    () => void (focusElement.current && focusElement.current!.focus()),
    [focusElement]
  );

  const { getFieldDecorator, getFieldsError, getFieldError } = form;

  // Only show error after a field is touched.
  const userNameError = getFieldError("username");
  const passwordError = getFieldError("password");

  const code = getCodeFromError(error);

  return (
    <Form layout="vertical" onSubmit={handleSubmit}>
      <Form.Item
        validateStatus={userNameError ? "error" : ""}
        help={userNameError || ""}
      >
        {getFieldDecorator("username", {
          rules: [{ required: true, message: "Please input your username" }],
        })(
          <Input
            size="large"
            prefix={<Icon type="user" style={{ color: "rgba(0,0,0,.25)" }} />}
            placeholder="E-mail or Username"
            ref={focusElement}
            data-cy="loginpage-input-username"
          />
        )}
      </Form.Item>
      <Form.Item
        validateStatus={passwordError ? "error" : ""}
        help={passwordError || ""}
      >
        {getFieldDecorator("password", {
          rules: [{ required: true, message: "Please input your Password" }],
        })(
          <Input
            prefix={<Icon type="lock" style={{ color: "rgba(0,0,0,.25)" }} />}
            size="large"
            type="password"
            placeholder="Password"
            data-cy="loginpage-input-password"
          />
        )}

        <Link href="/forgot">Forgotten password?</Link>
      </Form.Item>

      {error ? (
        <Form.Item>
          <Alert
            type="error"
            message={`Sign in failed`}
            description={
              <span>
                {extractError(error).message}
                {code ? (
                  <span>
                    {" "}
                    (Error code: <code>ERR_{code}</code>)
                  </span>
                ) : null}
              </span>
            }
          />
        </Form.Item>
      ) : null}
      <Form.Item>
        <Button
          type="primary"
          htmlType="submit"
          disabled={hasErrors(getFieldsError())}
          data-cy="loginpage-button-submit"
        >
          Sign in
        </Button>
        <Button type="link" style={{ marginLeft: 16 }} onClick={onCancel}>
          Use a different sign in method
        </Button>
      </Form.Item>
    </Form>
  );
}

const WrappedLoginForm = Form.create<LoginFormProps>({
  name: "login",
  onValuesChange(props) {
    props.setError(null);
  },
})(LoginForm);
