export default function Test() {
  const user = {
    name: 'John Doe',
  };
  return <div>Anyone with signed in {user?.name.toString()}</div>;
}
