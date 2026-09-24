import crystal from "../../../assets/themes/crystal/crystal-small.png";

export default function CrystalBackground() {
  return <div className="crystal-background" aria-hidden="true">
    {[0, 1, 2, 3, 4, 5].map(index => <img src={crystal} alt="" key={index}/>)}
  </div>;
}
