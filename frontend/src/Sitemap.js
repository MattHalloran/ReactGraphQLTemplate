import Routes from "Routes";
import DynamicSitemap from "react-dynamic-sitemap";

export default function Sitemap(props) {
	return (
		<DynamicSitemap routes={Routes} prettify={true} {...props}/>
	);
}